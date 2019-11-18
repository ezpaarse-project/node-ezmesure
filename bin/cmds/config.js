
exports.command = 'config <command>';
exports.desc = 'Manage config with a <command>: get, set, delete, view or edit';
exports.handler = function handler() {};
exports.builder = function builder(yargs) {
  return yargs.commandDir('config');
};
