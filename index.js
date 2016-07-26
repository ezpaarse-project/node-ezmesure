'use strict';

const request = require('request');
const baseUrl = 'https://localhost';
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NjY1MTEwMDN9.DGDp0pb1DlydJDubf4HCbYzntFsl-zOeXdTD3mlhPzM';
const options = {
  headers: { 
    'Authorization': 'Bearer ' + token
  },
  strictSSL: false
};
let params = {};


function query(params, callback) {

  options.uri = params.uri;

  request.get(options, (err, res, body) => {
    if (err) { return callback(err); }
    if (res.statusCode !== 200) {
      const rc = new Error('Invalid status return code');
      rc.statusCode = res.statusCode;
      rc.statusMessage = res.statusMessage;
      return callback(rc);
    }

    let ezmesure;

    try {
      ezmesure = JSON.parse(body);
    } catch (e) {
      return callback(e);
    }

    if (ezmesure.error) {
      return callback(null, null);
    }

    callback(null, ezmesure);
  });
}

/* 
['indexlist', 'indexcreate'].forEach(service => {
  exports[service] = function (params, callback) {
    if (typeof callback === 'function') { return query(service, params, callback); }

    return new Promise((resolve, reject) => {
      query(service, params, (err, ezmesure) => {
        if (err) { return reject(err); }
        resolve(ezmesure);
      });
    });
  };
});
*/

exports.indexlist = function (callback) {
  const service = "api/logs";
  params.uri = encodeURI(`${baseUrl}/${service}`);
  params.method = 'GET';

  if (typeof callback === 'function') { return query(params, callback); }

  return new Promise((resolve, reject) => {
    query(params, (err, ezmesure) => {
      if (err) { return reject(err); }
      resolve(ezmesure);
    });
  });
};

exports.indexinsert = function (params, callback) {
  const service = "api/logs";
  options.uri = encodeURI(`${baseUrl}/${service}/${params.index}`);
  params.method = 'POST';

  if (typeof callback === 'function') { return query(params, callback); }

  return new Promise((resolve, reject) => {
    query(params, (err, ezmesure) => {
      if (err) { return reject(err); }
      resolve(ezmesure);
    });
  });
};