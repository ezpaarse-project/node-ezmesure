'use strict';

exports.command = 'indices <command>';
exports.desc    = 'Manage indices with a <command>: list, insert or delete';
exports.handler = function (argv) {};
exports.builder = function (yargs) {
  return yargs.commandDir('indices');
};