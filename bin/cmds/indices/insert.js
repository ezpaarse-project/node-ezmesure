
const ProgressBar = require('progress');
const fs          = require('fs-extra');
const zlib        = require('zlib');
const path        = require('path');
const ezmesure    = require('../../..');

exports.command = 'insert <index> <files..>';
exports.desc = 'Insert <files> into an <index>';
exports.builder = function builder(yargs) {
  return yargs.option('z', {
    alias: 'gunzip',
    describe: 'Uncompress Gzip files locally',
    boolean: true,
  }).option('n', {
    alias: 'no-store',
    describe: 'Disable storing uploaded data in your online space',
    boolean: true,
  }).option('s', {
    alias: 'split',
    describe: 'Split a multivalued field. Format: "fieldname(delimitor)"',
  });
};
exports.handler = async function handler(argv) {
  const { files, index } = argv;

  const globalOptions = {
    gunzip: argv.gunzip,
    headers: {},
  };

  if (argv.u) { globalOptions.baseUrl = argv.u; }
  if (argv.token) { globalOptions.token = argv.token; }
  if (argv.timeout) { globalOptions.timeout = argv.timeout; }
  if (argv.insecure) { globalOptions.strictSSL = false; }
  if (argv.n) { globalOptions.store = false; }
  if (argv.split) { globalOptions.split = argv.split; }

  const aggs = {
    total: 0,
    inserted: 0,
    updated: 0,
    failed: 0,
  };

  for (const file of files) {
    const res = await insertFile(file, index, globalOptions);

    ['total', 'inserted', 'updated', 'failed'].forEach((cat) => {
      res[cat] = parseInt(res[cat], 10);
      aggs[cat] += res[cat] || 0;
    });

    printMetric('Total sent', res.total);
    printMetric('  Inserted', res.inserted, res.total);
    printMetric('  Updated', res.updated, res.total);
    printMetric('  Failed', res.failed, res.total);

    if (res.errors && res.errors.length) {
      printErrors(res.errors);
    }
  }

  console.log();
  console.log('Global metrics');
  console.log('--------------');
  printMetric('Files', files.length);
  printMetric('Total sent', aggs.total);
  printMetric('  Inserted', aggs.inserted, aggs.total);
  printMetric('  Updated', aggs.updated, aggs.total);
  printMetric('  Failed', aggs.failed, aggs.total);
};

function printMetric(label, value, total) {
  let msg = `  ${label}: ${value}`;

  if (total) {
    const percent = Math.round((value / total) * 100);
    msg += ` (${percent}%)`;
  }

  console.log(msg);
}

function printErrors(errors) {
  console.log('  Errors:');

  errors.forEach((error) => {
    let msg = `    ${error.reason || error.type}`;
    if (error.caused_by) {
      msg += ` (caused by: ${error.caused_by.reason || error.caused_by.type})`;
    }
    console.log(msg);
  });
}

async function insertFile(file, index, globalOptions) {
  const stats     = await fs.stat(file);
  const options   = { ...globalOptions };
  const barTokens = {
    index,
    file: path.basename(file),
  };

  console.log();

  const bar = new ProgressBar('  :file => :index [:bar] :percent :etas  ', {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: stats.size,
  });

  const fileReader = fs.createReadStream(file);

  fileReader.on('data', (chunk) => {
    bar.tick(chunk.length, barTokens);
  });

  let stream = fileReader;

  if (path.extname(file).toLowerCase() === '.gz') {
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
