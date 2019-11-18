
const os   = require('os');
const fs   = require('fs-extra');
const path = require('path');
const lget = require('lodash.get');
const lset = require('lodash.set');

const config = {
  baseUrl: 'https://ezmesure.couperin.org/api',
};

let scopes;

/**
 * Get config scopes, load environment if necessary
 */
function getScopes() {
  return scopes || loadEnv();
}

/**
 * Load config files
 */
function loadEnv() {
  scopes = {
    global: { location: path.resolve(os.homedir(), '.config', 'ezmesure', 'config.json') },
    local: { location: findLocalConfig() || path.resolve(process.cwd(), '.ezmesurerc') },
  };

  for (const type of Object.keys(scopes)) {
    try {
      const content = JSON.parse(fs.readFileSync(scopes[type].location, 'utf-8'));
      Object.assign(config, content);
      scopes[type].config = content;
    } catch (e) {
      if (e.code === 'ENOENT') {
        scopes[type].config = {};
      } else {
        throw e;
      }
    }
  }

  return scopes;
}

/**
 * Find the nearest config file
 * @param <String> startPath  optional start path, defaults to working dir
 */
function findLocalConfig(startPath) {
  const dir = path.resolve(startPath || process.cwd());

  try {
    fs.statSync(path.resolve(dir, '.ezmesurerc'));
    return path.resolve(dir, '.ezmesurerc');
  } catch (err) {
    if (err.code !== 'ENOENT') { return Promise.reject(err); }
  }

  if (path.dirname(dir) !== dir) {
    return findLocalConfig(path.dirname(dir));
  }

  return null;
}

module.exports = {
  config,
  loadEnv,
  getScopes,
  get(param, defaultValue) { return lget(config, param, defaultValue); },
  set(param, value) { return lset(config, param, value); },
};
