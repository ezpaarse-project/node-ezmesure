'use strict';

const ezmesure = require('../../..');

exports.command = 'delete <indice>';
exports.desc    = 'Delete <indice>';
exports.builder = {};
exports.handler = function (argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.insecure) { options.strictSSL = false; }

  ezmesure.indexDelete(argv.indice, options).then(res => {
    console.log('%s deleted', argv.indice);
  }).catch(err => {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  });
};