'use strict';

const fs   = require('fs');
const path = require('path');
const co   = require('co');

const defaults = exports.defaults = {
  baseUrl: 'https://ezmesure.couperin.org/api'
};

/**
 * Find the nearest config file
 * @param <String> startPath  optional start path, defaults to working dir
 */
exports.find = co.wrap(function* (startPath) {
  let dir = path.resolve(startPath || process.cwd());

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
exports.load = function (config) {
  return new Promise((resolve, reject) => {
    if (typeof config === 'object') {
      Object.assign(defaults, config);
      return resolve();
    }

    if (typeof config !== 'string') {
      return reject(new Error('config should be either an object or a string'));
    }

    fs.readFile(path.resolve(config), 'utf-8', (err, content) => {
      if (err) { return reject(err); }

      try {
        Object.assign(defaults, JSON.parse(content));
      } catch (e) {
        return reject(e);
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
      if (err) { return reject(err); }
      resolve(stats);
    });
  });
}
