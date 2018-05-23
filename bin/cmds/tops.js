'use strict';

const ezmesure = require('../..');
const co = require('co');

exports.command = 'tops <index>';
exports.desc    = 'Give top metrics for a given index';
exports.builder = function (yargs) {
  return yargs.option('s', {
    alias: 'size',
    describe: 'Size of the tops'
  }).option('p', {
    alias: 'period',
    describe: 'Period of the tops'
  });
};
exports.handler = co.wrap(function* (argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.timeout) { options.timeout = argv.timeout; }
  if (argv.size) { options.size = argv.size; }
  if (argv.period) { options.period = argv.period; }
  if (argv.insecure) { options.strictSSL = false; }

  let result;
  try {
    result = yield ezmesure.indices.tops(argv.index, options);
  } catch (err) {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  }

  const {
    docs = 0,
    dateCoverage = {},
    tops = {}
  } = result;

  const minDate = new Date(dateCoverage.min).toLocaleDateString();
  const maxDate = new Date(dateCoverage.max).toLocaleDateString();

  console.log(`Date coverage: from ${minDate} to ${maxDate}`);
  console.log(`Total events: ${docs}`);

  for (const metric in tops) {
    console.log(`\n   Top ${metric}   `);
    console.log('-'.repeat(metric.length + 10));
    const buckets = tops[metric];

    // Getting the size of the longest doc count for pretty indentation
    const maxChars = buckets.reduce((prev, cur) => Math.max(prev, cur.doc_count.toString().length), 0);

    buckets.forEach(bucket => {
      const spacing = '-'.repeat(maxChars - bucket.doc_count.toString().length + 1);
      console.log(`${bucket.doc_count} ${spacing} ${bucket.key}`);
    });
  }
});