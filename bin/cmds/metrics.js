'use strict';

const ezmesure = require('../..');
const co = require('co');

exports.command = 'metrics';
exports.desc    = 'Get overall metrics';
exports.handler = co.wrap(function* (argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.timeout) { options.timeout = argv.timeout; }
  if (argv.insecure) { options.strictSSL = false; }

  let result;
  try {
    result = yield ezmesure.indices.metrics(options);
  } catch (err) {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  }

  const {
    docs = 0,
    dateCoverage = {},
    metrics = {}
  } = result;

  const minDate = new Date(dateCoverage.min).toLocaleDateString();
  const maxDate = new Date(dateCoverage.max).toLocaleDateString();

  console.log(`Date coverage: ${metrics.days} days (from ${minDate} to ${maxDate})\n`);
  console.log(`Events ---- ${docs}`);
  console.log(`Indices --- ${metrics.indices || 'N/A'}`);
  console.log(`Titles ---- ${metrics.titles || 'N/A'}`);
  console.log(`Platforms - ${metrics.platforms || 'N/A'}`);
});
