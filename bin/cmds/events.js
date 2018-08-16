'use strict';

exports.command = 'events <command>';
exports.desc    = 'Manage consultation events with a <command>: delete';
exports.handler = function (argv) {};
exports.builder = function (yargs) {
  return yargs.commandDir('events');
};