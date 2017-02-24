'use strict';

const ezmesure = require('../../../index.js');
const co = require('co');

exports.command = 'list';
exports.desc    = 'List indices';
exports.builder = {};
exports.handler = co.wrap(function* (argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.insecure) { options.strictSSL = false; }

  let list;
  try {
    list = yield ezmesure.indices.list(options);
  } catch (err) {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  }

  if (list.length === 0) {
    return console.log('No indices');
  }

  // Getting the size of the longest name for pretty indentation
  const maxChars = list.reduce((prev, cur) => Math.max(prev, cur.name.length), 6);

  console.log(`Indice ${' '.repeat(maxChars - 5)} Documents`);

  list.forEach(indice => {
    const spacing = '-'.repeat(maxChars - indice.name.length + 1);
    console.log(`${indice.name} ${spacing} ${indice.docs}`);
  });
});