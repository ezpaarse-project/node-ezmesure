
exports.command = 'events <command>';
exports.desc = 'Manage consultation events with a <command>: delete';
exports.handler = function handler() {};
exports.builder = function builder(yargs) {
  return yargs.commandDir('events');
};
