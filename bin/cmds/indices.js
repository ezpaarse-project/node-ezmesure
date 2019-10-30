
exports.command = 'indices <command>';
exports.desc = 'Manage indices with a <command>: list, insert or delete';
exports.handler = function handler() {};
exports.builder = function builder(yargs) {
  return yargs.commandDir('indices');
};
