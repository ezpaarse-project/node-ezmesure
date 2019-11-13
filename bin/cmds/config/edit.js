const fs = require('fs-extra');
const { prompt } = require('enquirer');
const { spawn } = require('child_process');
const { scopes } = require('../../../lib/config');

exports.command = 'edit';
exports.desc = 'Edit configuration';
exports.builder = function builder(yargs) {
  return yargs.option('global', {
    alias: 'g',
    describe: 'Edit global config',
    boolean: true,
  }).option('interactive', {
    alias: 'i',
    describe: '',
  }).option('editor', {
    alias: 'e',
    describe: 'The editor command to use. Defaults to EDITOR environment variable if set, or "vi" on Posix, or "notepad" on Windows',
  });
};
exports.handler = async function handler(argv) {
  const scope = scopes[argv.global ? 'global' : 'local'];
  const editor = argv.editor || process.env.EDITOR || (/^win/.test(process.platform) ? 'notepad' : 'vi');

  if (!argv.interactive) {
    const args = editor.split(/\s+/);
    const bin = args.shift();

    spawn(bin, [...args, scope.location], { stdio: 'inherit' });
    return;
  }

  await fs.ensureFile(scope.location);

  let action;
  try {
    ({ action } = await selectAction());
  } catch (e) {
    action = null;
  }

  while (action) {
    let response;
    try {
      response = await prompt(action);
    } catch (e) {
      response = {};
    }

    if (Object.hasOwnProperty.call(response, action.name)) {
      scope.config[action.name] = response[action.name];
    }

    await fs.writeFile(scope.location, JSON.stringify(scope.config, null, 2));

    try {
      ({ action } = await selectAction());
    } catch (e) {
      action = null;
    }
  }

  /**
   * Select an option to edit
   */
  function selectAction() {
    const options = [
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Base API URL',
        initial: scope.config.baseUrl,
      },
      {
        type: 'input',
        name: 'token',
        message: 'Authentication token',
        initial: scope.config.token,
      },
      {
        type: 'toggle',
        name: 'store',
        message: 'Store uploaded data',
        enabled: 'yes',
        disabled: 'no',
        initial: scope.config.store,
      },
      {
        type: 'toggle',
        name: 'strictSSL',
        message: 'Validate SSL certificates',
        enabled: 'yes',
        disabled: 'no',
        initial: scope.config.strictSSL,
      },
      {
        type: 'numeral',
        name: 'timeout',
        message: 'Request timeout in milliseconds',
        initial: scope.config.timeout,
        result: (val) => Number.parseInt(val, 10),
      },
    ];

    return prompt({
      type: 'select',
      name: 'action',
      message: 'What do you want to set ?',
      choices: options.map((o) => ({
        name: o.name,
        hint: o.message,
      })),
      result(name) {
        return options.find((opt) => opt.name === name);
      },
    });
  }
};
