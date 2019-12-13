
const fs       = require('fs-extra');
const zlib     = require('zlib');
const path     = require('path');
const chalk    = require('chalk');
const logger   = require('../../../lib/logger')();
const ezmesure = require('../../..');

exports.command = 'insert <index> <files..>';
exports.desc = 'Insert <files> into an <index>';
exports.builder = function builder(yargs) {
  return yargs
    .option('z', {
      alias: 'gunzip',
      describe: 'Uncompress Gzip files locally',
      boolean: true,
    })
    .option('n', {
      alias: 'no-store',
      describe: 'Disable storing uploaded data in your online space',
      boolean: true,
    })
    .option('r', {
      alias: 'recursive',
      describe: 'Look for files in subdirectories',
      boolean: true,
    })
    .option('s', {
      alias: 'split',
      describe: 'Split a multivalued field. Format: "fieldname(delimitor)"',
    })
    .option('ext', {
      describe: 'Specify file extensions - default: .csv,.csv.gz',
    });
};
exports.handler = async function handler(argv) {
  const { files: filePaths, index, recursive } = argv;

  const globalOptions = {
    gunzip: argv.gunzip,
    headers: {},
  };

  let extensions = ['.csv', '.csv.gz'];

  if (typeof argv.ext === 'string') {
    extensions = argv.ext.split(',').map((ext) => {
      const e = ext.trim();
      return e.startsWith('.') ? e : `.${e}`;
    });
  }

  if (argv.u) { globalOptions.baseUrl = argv.u; }
  if (argv.token) { globalOptions.token = argv.token; }
  if (argv.timeout) { globalOptions.timeout = argv.timeout; }
  if (argv.insecure) { globalOptions.strictSSL = false; }
  if (argv.n) { globalOptions.store = false; }
  if (argv.split) { globalOptions.split = argv.split; }

  let nbSkipped = 0;
  let nbFailed = 0;

  const aggs = {
    total: 0,
    inserted: 0,
    updated: 0,
    failed: 0,
  };

  const files = await resolveFiles(filePaths, { extensions, recursive, root: true });

  for (const file of files) {
    const baseFile = file.path.substr(0, file.path.length - file.extension.length);
    const reportFile = `${baseFile}.report.json`;
    let report;

    try {
      report = JSON.parse(await fs.readFile(reportFile));
    } catch (e) {
      if (e.code !== 'ENOENT') {
        logger.error(e.message);
        continue; // eslint-disable-line no-continue
      }
    }

    if (report && !report.error) {
      const reportDate = (new Date(report.date)).getTime();

      if (!Number.isNaN(reportDate) && file.mtime.getTime() <= reportDate) {
        logger.skip(file.basename);
        nbSkipped += 1;
        continue; // eslint-disable-line no-continue
      }
    }

    try {
      await fs.remove(reportFile);
    } catch (e) {
      if (e.code !== 'ENOENT') {
        logger.error(e.message);
      }
    }

    const reportContent = {
      date: new Date(),
      error: null,
    };

    let res;
    try {
      res = await insertFile(file, index, globalOptions);
    } catch (e) {
      nbFailed += 1;
      logger.error(e.message);
      logger.failed(file.basename);

      reportContent.error = e.message;

      try {
        await fs.writeFile(reportFile, JSON.stringify(reportContent, null, 2));
      } catch (err) {
        logger.error(err.message);
      }

      continue; // eslint-disable-line no-continue
    }

    logger.loaded(file.basename);

    aggs.total += Number.parseInt(res.total, 10) || 0;
    aggs.inserted += Number.parseInt(res.inserted, 10) || 0;
    aggs.updated += Number.parseInt(res.updated, 10) || 0;
    aggs.failed += Number.parseInt(res.failed, 10) || 0;

    printMetrics(res);

    if (res.errors && res.errors.length) {
      res.errors.forEach((error) => {
        let msg = `Error: ${error.reason || error.type}`;
        if (error.caused_by) {
          msg += ` (caused by: ${error.caused_by.reason || error.caused_by.type})`;
        }
        logger.warn(msg);
      });
    }

    reportContent.response = res;

    try {
      await fs.writeFile(reportFile, JSON.stringify(reportContent, null, 2));
    } catch (err) {
      logger.error(err.message);
    }
  }

  const nbLoaded = files.length - nbSkipped - nbFailed;

  let msg = 'Files: ';
  if (nbFailed > 0) {
    msg += chalk.red(`${nbFailed} failed, `);
  }
  if (nbLoaded > 0) {
    msg += chalk.green(`${nbLoaded} loaded, `);
  }
  if (nbSkipped > 0) {
    msg += chalk.yellow(`${nbSkipped} skipped, `);
  }
  msg += `${files.length} total`;

  if (nbFailed > 0) {
    logger.error(msg);
  } else {
    logger.summary(msg);
  }

  printMetrics(aggs, { summary: true });

  process.exit(nbFailed > 0 ? 1 : 0);
};

function printMetrics(metrics, opts = {}) {
  const { summary } = opts;
  const {
    inserted,
    total,
    updated,
    failed,
  } = metrics;

  const percentInserted = `${toPercent(inserted, total)}%`.padStart(4);
  const percentUpdated = `${toPercent(updated, total)}%`.padStart(4);
  const percentFailed = `${toPercent(failed, total)}%`.padStart(4);

  const totalInserted = `${inserted}/${total}`;
  const totalUpdated = `${updated}/${total}`;
  const totalFailed = `${failed}/${total}`;

  const maxLength = Math.max(totalInserted.length, totalUpdated.length, totalFailed.length);
  const type = summary ? 'summary' : 'info';

  logger[type](`Inserted ${percentInserted} ${totalInserted.padStart(maxLength)}`);
  logger[type](`Updated  ${percentUpdated} ${totalUpdated.padStart(maxLength)}`);
  logger[type](`Failed   ${percentFailed} ${totalFailed.padStart(maxLength)}`);
}

function toPercent(value, total) {
  if (!total) { return 0; }
  return Math.round((value / total) * 100);
}

async function resolveFiles(filePaths, { extensions, recursive, root }) {
  let files = [];

  for (const file of filePaths) {
    const resolvedPath = path.resolve(file);
    const stat = await fs.stat(resolvedPath);

    if (stat.isFile()) {
      const extension = extensions.find((ext) => file.endsWith(ext));

      if (extension) {
        files.push({
          path: resolvedPath,
          basename: path.basename(file),
          mtime: stat.mtime,
          extension,
        });
      }
    } else if (stat.isDirectory() && (recursive || root)) {
      const subFiles = (await fs.readdir(resolvedPath)).map((f) => path.resolve(resolvedPath, f));

      files = [
        ...files,
        ...await resolveFiles(subFiles, { extensions, recursive }),
      ];
    }
  }

  return files;
}

async function insertFile(file, index, globalOptions) {
  const stats   = await fs.stat(file.path);
  const options = { ...globalOptions };

  const fileReader = fs.createReadStream(file.path);
  const total = stats.size;
  let loaded = 0;

  const interval = setInterval(() => {
    const percent = Math.floor((loaded / total) * 100);
    logger.loading(`[${percent}%] ${file.basename}`);
  }, 5000);

  fileReader.on('data', (chunk) => {
    loaded += chunk.length;
  });
  fileReader.on('close', () => {
    clearInterval(interval);
  });

  let stream = fileReader;

  if (path.extname(file.basename).toLowerCase() === '.gz') {
    if (globalOptions.gunzip) {
      stream = zlib.createGunzip();
      fileReader.pipe(stream);
    } else {
      options.headers['content-encoding'] = 'application/gzip';
      options.headers['content-length'] = stats.size;
    }
  }

  return ezmesure.indices.insert(stream, index, options).then((res) => res || Promise.reject(new Error('No result')));
}
