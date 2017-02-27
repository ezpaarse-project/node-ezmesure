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

  co(function* () {
    for (const file of files) {
      try {
        yield insertFile(file, indice, globalOptions);
      } catch (e) {
        console.error(e);
      }
    }
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
};

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

    yield ezmesure.indices.insert(fileReader, indice, options).then(res => {
      if (!res) {
        return Promise.reject(new Error('No result'));
      }

      console.log('  [%s] Inserted', res.inserted);
      console.log('  [%s] Not inserted', res.failed);

      if (res.errors && res.errors.length) {
        console.log('  Errors:');

        res.errors.forEach(error => {
          let msg = `    ${error.reason || error.type}`;
          if (error.caused_by) {
            msg += ` (caused by: ${error.caused_by.reason || error.caused_by.type})`;
          }
          console.log(msg);
        });
      }
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
