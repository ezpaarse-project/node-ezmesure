'use strict';

const request = require('request');
const fs      = require('fs');
const path    = require('path');
const co      = require('co');
const config  = require('./config');

const services = {
  logs: '/logs'
};

exports.list = function (options, callback) {
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

exports.delete = function (indice, options) {
  return promisedQuery('DELETE', `${services.logs}/${indice}`, options).then(res => {
    if (res && res.hasOwnProperty('acknowledged')) { return res; }

    return Promise.reject(new Error('Invalid response'));
  });
};

exports.insert = co.wrap(function* (file, indice, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.timeout = options.timeout || 300000;

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
    stream.pipe(query('POST', `${services.logs}/${indice}`, options, (err, res) => {
      if (err) { reject(err); }
      resolve(res);
    }));
  });
});

/**
 * Wrapper that just promisify the query function
 */
function promisedQuery(method, pathName, options) {
  return new Promise((resolve, reject) => {
    query(method, pathName, options, (err, res) => {
      if (err) { return reject(err); }
      resolve(res);
    });
  });
}

/**
 * Perform a query to ezMESURE
 * @param <String> method    GET, POST, PUT...
 * @param <String> pathName  url PATH
 * @param <Object> options
 *                 <String>  baseUrl   full URL of the API
 *                 <Object>  headers   headers to send
 *                 <String>  token     JWT auth token
 *                 <Boolean> scritSSL  enable/disable SSL cert verification
 * @returns <Object> request stream
 */
function query(method, pathName, options, callback) {

  options = Object.assign({}, config.defaults, options);

  const reqOptions = {
    method,
    baseUrl: options.baseUrl,
    timeout: options.timeout || 30000,
    uri: encodeURI(pathName),
    headers: options.headers || {}
  };

  if (options.token) {
    reqOptions.headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options.hasOwnProperty('strictSSL')) {
    reqOptions.strictSSL = options.strictSSL;
  }

  return request(reqOptions, (err, res, body) => {
    if (err) { return callback(err); }

    if (res.statusCode >= 300) {
      const rc = new Error(`Invalid status code: ${res.statusCode} ${res.statusMessage}`);
      rc.statusCode = res.statusCode;
      rc.statusMessage = res.statusMessage;
      return callback(rc);
    }

    let result;

    try {
      result = JSON.parse(body);
    } catch (e) {
      return callback(e);
    }

    if (result.error) {
      return callback(new Error('ezMESURE returned with an error'), result);
    }

    callback(null, result);
  });
}

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
