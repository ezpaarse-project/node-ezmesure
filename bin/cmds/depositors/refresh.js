'use strict';

const ezmesure = require('../../..');

exports.command = 'refresh';
exports.desc    = 'Refresh the depositors list';
exports.handler = function (argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.timeout) { options.timeout = argv.timeout; }
  if (argv.insecure) { options.strictSSL = false; }

  ezmesure.depositors.refresh(options).then(res => {
    let nbErrors  = 0;
    let nbSuccess = 0;

    res.items.forEach(item => {
      const name   = item.name || '...';
      const prefix = item.prefix || 'none';
      const count  = item.count || 0;

      if (item.error) {
        nbErrors++;
        console.error(`[Error] ${item.name} : ${item.error}`);
      } else {
        console.log(`${name} (prefix: ${prefix}, count: ${count})`);
        nbSuccess++;
      }
    });

    console.log(`${nbSuccess} updated, ${nbErrors} errors`);
    process.exit(nbErrors ? 1: 0);
  }).catch(err => {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  });
};