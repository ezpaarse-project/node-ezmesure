'use strict';

exports.command = 'indices <command>';
exports.desc    = 'Manage indices';
exports.handler = function (argv) {};
exports.builder = function (yargs) {
  return yargs.commandDir('indices');
};