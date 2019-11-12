const fs = require('fs-extra');
const unset = require('lodash.unset');
const { scopes } = require('../../../lib/config');

exports.command = 'delete <key>';
exports.desc = 'Delete a key in the config';
exports.builder = function builder(yargs) {
  return yargs.option('global', {
    alias: 'g',
    describe: 'Delete key globally',
    boolean: true,
  });
};
exports.handler = async function handler(argv) {
  const scope = scopes[argv.global ? 'global' : 'local'];

  if (!scope) { return; }

  const config = scope.config || {};
  unset(config, argv.key);

  await fs.ensureFile(scope.location);
  await fs.writeFile(scope.location, JSON.stringify(config, null, 2));
};
