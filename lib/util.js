'use strict';

const request = require('request');
const fs      = require('fs');
const config  = require('./config');

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
    headers: options.headers || {},
    qs: options.qs || {}
  };

  if (options.token) {
    reqOptions.headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options.hasOwnProperty('strictSSL')) {
    reqOptions.strictSSL = options.strictSSL;
  }

  return request(reqOptions, (err, res, body) => {
    if (err) { return callback(err); }

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
      return callback(rc);
    }

    if (result.error) {
      return callback(new Error(result.error), result);
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

module.exports = {
  promisedQuery,
  query,
  getStats
};
