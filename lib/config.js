
const fs   = require('fs');
const path = require('path');
const co   = require('co');

const defaults = {
  baseUrl: 'https://ezmesure.couperin.org/api',
};

exports.defaults = defaults;

/**
 * Find the nearest config file
 * @param <String> startPath  optional start path, defaults to working dir
 */
exports.find = co.wrap(function* find(startPath) {
  const dir = path.resolve(startPath || process.cwd());

  try {
    yield getStats(path.resolve(dir, '.ezmesurerc'));
    return path.resolve(dir, '.ezmesurerc');
  } catch (err) {
    if (err.code !== 'ENOENT') { return Promise.reject(err); }
  }

  if (path.dirname(dir) !== dir) {
    return exports.find(path.dirname(dir));
  }

  return null;
});

/**
 * Load config with either a plain object or a path to a config file
 */
exports.load = function load(config) {
  return new Promise((resolve, reject) => {
    if (typeof config === 'object') {
      Object.assign(defaults, config);
      resolve();
      return;
    }

    if (typeof config !== 'string') {
      reject(new Error('config should be either an object or a string'));
      return;
    }

    fs.readFile(path.resolve(config), 'utf-8', (err, content) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        Object.assign(defaults, JSON.parse(content));
      } catch (e) {
        reject(e);
        return;
      }

      resolve();
    });
  });
};

/**
 * Promisified fs.stat
 */
function getStats(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}
