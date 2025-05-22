
const axios = require('axios').default;
const fs = require('fs-extra');
const { Agent } = require('https');
const { config } = require('./config');

/**
 * Correctly resolve an url
 *
 * @param {string} path The path
 * @param {string} baseUrl The base URL
 *
 * @returns {URL} The resolved URL
 */
const urlResolve = (path, baseUrl) => {
  const baseLastIndex = baseUrl.length - 1;
  const base = baseUrl[baseLastIndex] === '/' ? baseUrl : `${baseUrl}/`;

  const p = path[0] === '/' ? path.substring(1) : path;
  return new URL(p, base);
};

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
 *                 <Boolean> strictSSL  enable/disable SSL cert verification
 *                 <String> responseType  responseType
 */
function query(method, pathName, opts, callback) {
  const options = { ...config, ...opts };

  const reqOptions = {
    method,
    timeout: Number.isInteger(options.timeout) ? options.timeout : 30000,
    url: urlResolve(encodeURI(pathName), options.baseUrl),
    headers: options.headers || {},
    params: options.qs || {},
    validateStatus: (status) => status >= 200 && status < 400,
    responseType: options.responseType,
    data: opts.data,
  };

  if (options.token) {
    reqOptions.headers.Authorization = `Bearer ${options.token}`;
  }
  if (Object.hasOwnProperty.call(options, 'strictSSL')) {
    reqOptions.httpsAgent = new Agent({ rejectUnauthorized: false });
  }

  axios(reqOptions)
    .then((res) => {
      const result = res.data;

      if (res.status >= 300) {
        const rc = new Error(result.error || `${res.status} ${res.statusText}`);
        rc.statusCode = res.status;
        rc.statusMessage = res.statusText;
        callback(rc);
        return;
      }

      if (result.error) {
        callback(new Error(result.error), result);
        return;
      }

      callback(null, result);
    })
    .catch((err) => {
      callback(err);
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
