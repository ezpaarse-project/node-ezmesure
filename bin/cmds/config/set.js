const fs = require('fs-extra');
const set = require('lodash.set');
const scopes = require('../../../lib/config').getScopes();

exports.command = 'set <key> <value>';
exports.desc = 'Set the value of a key in the config';
exports.builder = function builder(yargs) {
  return yargs.option('global', {
    alias: 'g',
    describe: 'Set config globally',
    boolean: true,
  });
};
exports.handler = async function handler(argv) {
  const scope = scopes[argv.global ? 'global' : 'local'];
  const config = scope.config || {};

  set(config, argv.key, argv.value);

  await fs.ensureFile(scope.location);
  await fs.writeFile(scope.location, JSON.stringify(config, null, 2));
};
