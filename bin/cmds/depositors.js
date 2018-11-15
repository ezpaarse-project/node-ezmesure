'use strict';

exports.command = 'depositors <command>';
exports.desc    = 'Manage depositors with a <command>: refresh';
exports.handler = function (argv) {};
exports.builder = function (yargs) {
  return yargs.commandDir('depositors');
};