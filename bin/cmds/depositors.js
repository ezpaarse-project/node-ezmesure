
exports.command = 'depositors <command>';
exports.desc = 'Manage depositors with a <command>: refresh';
exports.handler = function handler() {};
exports.builder = function builder(yargs) {
  return yargs.commandDir('depositors');
};
