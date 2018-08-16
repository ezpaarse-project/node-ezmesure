'use strict';

const ezmesure = require('../../..');

exports.command = 'delete <index>';
exports.desc    = 'Delete consultation events from <index>';
exports.builder = function (yargs) {
  return yargs.option('from', {
    describe: 'Minimum date of the events that should be removed. Can be either a date or datetime in ISO format.'
  }).option('to', {
    describe: 'Maximum date of the events that should be removed. Can be either a date or datetime in ISO format.'
  });
};
exports.handler = function (argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.timeout) { options.timeout = argv.timeout; }
  if (argv.insecure) { options.strictSSL = false; }
  if (argv.from) { options.from = argv.from; }
  if (argv.to) { options.to = argv.to; }

  ezmesure.events.delete(argv.index, options).then(res => {
    console.log(`${res.deleted} events deleted from ${argv.index}`);
  }).catch(err => {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  });
};