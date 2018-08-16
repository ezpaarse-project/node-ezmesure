'use strict';

const fs      = require('fs');
const path    = require('path');
const co      = require('co');
const config  = require('./config');

const { getStats, query, promisedQuery } = require('./util');

const services = {
  logs: '/logs',
  metrics: '/metrics'
};

exports.list = function (options) {
  return promisedQuery('GET', services.logs, options).then(res => {
    if (!res || !res.indices) { return Promise.reject(new Error('Invalid response')); }

    return Object.keys(res.indices)
      .filter(name => !name.startsWith('.'))
      .sort()
      .map(name => {
        return {
          name,
          docs: res.indices[name].primaries.docs.count
        };
      });
  });
};

exports.metrics = function (options) {
  return promisedQuery('GET', services.metrics, options).then(res => {
    return res || Promise.reject(new Error('Invalid response'));
  });
};

exports.tops = function (index, options) {
  options = options || {};
  options.qs = options.qs || {};

  if (options.period) {
    options.qs.period = options.period;
    delete options.period;
  }
  if (options.size) {
    options.qs.size = options.size;
    delete options.size;
  }

  return promisedQuery('GET', `${services.logs}/${index}/tops`, options).then(res => {
    return res || Promise.reject(new Error('Invalid response'));
  });
};

exports.delete = function (index, options) {
  return promisedQuery('DELETE', `${services.logs}/${index}`, options).then(res => {
    if (res && res.hasOwnProperty('acknowledged')) { return res; }

    return Promise.reject(new Error('Invalid response'));
  });
};

exports.insert = co.wrap(function* (file, index, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.qs = options.qs || {};
  options.timeout = options.timeout || 300000;

  if (options.store === false) {
    options.qs.nostore = true;
  }

  if (!options.hasOwnProperty('store')) {
    options.store = config.defaults.store;
  }

  if (options.store === false) {
    options.qs.nostore = true;
  }

  if (options.split) {
    const split = Array.isArray(options.split) ? options.split : [options.split];
    options.headers['split-fields'] = split.join(' ');
  }

  let stream = file;

  if (typeof file === 'string') {
    const stats = yield getStats(file);

    options.headers['content-length'] = stats.size;

    if (path.extname(file).toLowerCase() === '.gz') {
      options.headers['content-encoding'] = 'application/gzip';
    }

    stream = fs.createReadStream(file);

  } else if (typeof file !== 'object' || typeof file.pipe !== 'function') {
    return new Error('Unsupported file type, use either path or stream');
  }

  return new Promise((resolve, reject) => {
    stream.pipe(query('POST', `${services.logs}/${index}`, options, (err, res) => {
      if (err) { reject(err); }
      resolve(res);
    }));
  });
});
