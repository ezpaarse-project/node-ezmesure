const config = require('../../../lib/config');

exports.command = 'get <key>';
exports.desc = 'Get the value of a key in the config';
exports.builder = {};
exports.handler = async function handler(argv) {
  console.log(config.get(argv.key, ''));
};
