
const fs     = require('fs-extra');
const path   = require('path');

const config = require('./config');
const { query, promisedQuery } = require('./util');

const services = {
  logs: '/logs',
  metrics: '/metrics',
};

exports.list = function list(options) {
  return promisedQuery('GET', services.logs, options).then((res) => {
    if (!res || !res.indices) { return Promise.reject(new Error('Invalid response')); }

    return Object.keys(res.indices)
      .filter((name) => !name.startsWith('.'))
      .sort()
      .map((name) => ({
        name,
        docs: res.indices[name].primaries.docs.count,
      }));
  });
};

exports.metrics = function metrics(options) {
  return promisedQuery('GET', services.metrics, options).then((res) => res || Promise.reject(new Error('Invalid response')));
};

exports.tops = function tops(index, opts) {
  const options = opts || {};
  options.qs = options.qs || {};

  if (options.period) {
    options.qs.period = options.period;
    delete options.period;
  }
  if (options.size) {
    options.qs.size = options.size;
    delete options.size;
  }

  return promisedQuery('GET', `${services.logs}/${index}/tops`, options).then((res) => res || Promise.reject(new Error('Invalid response')));
};

exports.delete = function del(index, options) {
  return promisedQuery('DELETE', `${services.logs}/${index}`, options).then((res) => {
    if (res && Object.hasOwnProperty.call(res, 'acknowledged')) { return res; }

    return Promise.reject(new Error('Invalid response'));
  });
};

exports.insert = async function insert(file, index, opts) {
  const options = opts || {};
  options.headers = options.headers || {};
  options.qs = options.qs || {};
  options.timeout = options.timeout || 0;

  if (options.store === false) {
    options.qs.nostore = true;
  }

  if (!Object.hasOwnProperty.call(options, 'store')) {
    options.store = config.get('store');
  }

  if (options.store === false) {
    options.qs.nostore = true;
  }

  if (options.split) {
    const split = Array.isArray(options.split) ? options.split : [options.split];
    options.headers['split-fields'] = split.join(' ');
  }

  options.data = file;

  if (typeof file === 'string') {
    const stats = await fs.stat(file);

    options.headers['content-length'] = stats.size;

    if (path.extname(file).toLowerCase() === '.gz') {
      options.headers['content-encoding'] = 'application/gzip';
    }

    options.data = fs.createReadStream(file);
  } else if (typeof file !== 'object' || typeof file.pipe !== 'function') {
    return new Error('Unsupported file type, use either path or stream');
  }

  return new Promise((resolve, reject) => {
    query('POST', `${services.logs}/${index}`, options, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};
