
const request = require('request');
const fs      = require('fs-extra');
const config  = require('./config');

/**
 * Wrapper that just promisify the query function
 */
function promisedQuery(method, pathName, options) {
  return new Promise((resolve, reject) => {
    query(method, pathName, options, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
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
function query(method, pathName, opts, callback) {
  const options = { ...config.defaults, ...opts };

  const reqOptions = {
    method,
    baseUrl: options.baseUrl,
    timeout: options.timeout || 30000,
    uri: encodeURI(pathName),
    headers: options.headers || {},
    qs: options.qs || {},
  };

  if (options.token) {
    reqOptions.headers.Authorization = `Bearer ${options.token}`;
  }
  if (Object.hasOwnProperty.call(options, 'strictSSL')) {
    reqOptions.strictSSL = options.strictSSL;
  }

  return request(reqOptions, (err, res, body) => {
    if (err) {
      callback(err);
      return;
    }

    let result;

    try {
      result = JSON.parse(body);
    } catch (e) {
      result = {};
    }

    if (res.statusCode >= 300) {
      const rc = new Error(result.error || `${res.statusCode} ${res.statusMessage}`);
      rc.statusCode = res.statusCode;
      rc.statusMessage = res.statusMessage;
      callback(rc);
      return;
    }

    if (result.error) {
      callback(new Error(result.error), result);
      return;
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
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

module.exports = {
  promisedQuery,
  query,
  getStats,
};
