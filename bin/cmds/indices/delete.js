'use strict';

const ezmesure = require('../../..');

exports.command = 'delete <index>';
exports.desc    = 'Delete <index>';
exports.builder = {};
exports.handler = function (argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.timeout) { options.timeout = argv.timeout; }
  if (argv.insecure) { options.strictSSL = false; }

  ezmesure.indices.delete(argv.index, options).then(res => {
    console.log('%s deleted', argv.index);
  }).catch(err => {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  });
};