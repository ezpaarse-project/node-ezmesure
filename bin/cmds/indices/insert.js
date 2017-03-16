'use strict';

const ezmesure    = require('../../..');
const ProgressBar = require('progress');
const fs          = require('fs');
const co          = require('co');
const path        = require('path');

exports.command = 'insert <indice> <files..>';
exports.desc    = 'Insert <file> into an <indice>';
exports.builder = {};
exports.handler = function (argv) {
  const { files, indice } = argv;

  const globalOptions = { headers: {} };

  if (argv.u) { globalOptions.baseUrl = argv.u; }
  if (argv.token) { globalOptions.token = argv.token; }
  if (argv.insecure) { globalOptions.strictSSL = false; }

  const aggs = {
    total: 0,
    inserted: 0,
    updated: 0,
    failed: 0
  };

  co(function* () {
    for (const file of files) {
      let res;
      try {
        res = yield insertFile(file, indice, globalOptions);
      } catch (e) {
        console.error(e);
        continue;
      }

      ['total','inserted','updated','failed'].forEach(cat => {
        res[cat] = parseInt(res[cat]);
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

  }).catch(e => {
    console.error(e);
    process.exit(1);
  });

};

function printMetric(label, value, total) {
  let msg = `  ${label}: ${value}`;

  if (total) {
    const percent = Math.round(value / total * 100);
    msg += ` (${percent}%)`;
  }

  console.log(msg);
}

function printErrors(errors) {
  console.log('  Errors:');

  errors.forEach(error => {
    let msg = `    ${error.reason || error.type}`;
    if (error.caused_by) {
      msg += ` (caused by: ${error.caused_by.reason || error.caused_by.type})`;
    }
    console.log(msg);
  });
}

function insertFile(file, indice, globalOptions) {
  return co(function* () {
    const stats     = yield getStats(file);
    const options   = Object.assign({}, globalOptions);
    const barTokens = {
      indice,
      file: path.basename(file)
    };

    options.headers['content-length'] = stats.size;

    if (path.extname(file).toLowerCase() === '.gz') {
      options.headers['content-encoding'] = 'application/gzip';
    }

    console.log();

    let bar = new ProgressBar('  :file => :indice [:bar] :percent :etas  ', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: stats.size
    });

    const fileReader = fs.createReadStream(file);

    fileReader.on('data', chunk => {
      bar.tick(chunk.length, barTokens);
    });

    return ezmesure.indices.insert(fileReader, indice, options).then(res => {
      return res || Promise.reject(new Error('No result'));
    });
  });
}

function getStats(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) { return reject(err); }
      resolve(stats);
    });
  });
}
