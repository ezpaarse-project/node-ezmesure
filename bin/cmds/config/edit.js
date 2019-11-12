const { spawn } = require('child_process');
const { scopes } = require('../../../lib/config');

exports.command = 'edit';
exports.desc = 'Edit configuration';
exports.builder = function builder(yargs) {
  return yargs.option('global', {
    alias: 'g',
    describe: 'Edit global config',
    boolean: true,
  }).option('editor', {
    alias: 'e',
    describe: 'The editor command to use. Defaults to EDITOR environment variable if set, or "vi" on Posix, or "notepad" on Windows',
  });
};
exports.handler = async function handler(argv) {
  const scope = scopes[argv.global ? 'global' : 'local'];
  const editor = argv.editor || process.env.EDITOR || (/^win/.test(process.platform) ? 'notepad' : 'vim');

  const args = editor.split(/\s+/);
  const bin = args.shift();

  spawn(bin, [...args, scope.location], { stdio: 'inherit' });
};
