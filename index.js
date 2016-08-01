'use strict';

const request = require('request');
const fs = require('fs');
const configFile = '.ezmesurerc';
let options = {};
let config = {};

// load local configuration

let configRaw;
try {
  configRaw = fs.readFileSync(configFile);
} catch (e) {
  if (e.code === 'ENOENT') {
    throw new Error('Configuration file .ezmesurerc not found');
  }
  throw e;
}

config = JSON.parse(configRaw);

exports.config = config;
exports.options = options;

exports.authentication = function(token) {
  if (!token) {
    throw new Error('Token is mandatory, check your config');
  }
  options.headers = {'Authorization': `Bearer ${token}`};
  options.strictSSL = false;
};

exports.isEzmesureIndex = function (element) {
  return !element.startsWith('.');
};

exports.getEzMesureIndex = function (list) {
  let ezMesureIndexList = Object.keys(list.indices).filter(this.isEzmesureIndex).sort();
  let ezMesureIndex = {};
  ezMesureIndexList.forEach((index) => {
    ezMesureIndex[index] = list.indices[index].total.docs.count;
  });
  return ezMesureIndex;
};

function query(params, callback) {

  request(options, (err, res, body) => {
    // console.log(body);
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

function queryinsert(params, callback) {

  fs.createReadStream(params.file)
    .pipe(request(options, (err, res, body) => {
      // console.log(body);
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
    })
  );
}

exports.indexList = function (params, callback) {
  const service = 'api/logs';
  options.uri = encodeURI(`${params.baseUrl}/${service}`);
  options.method = 'GET';

  if (typeof callback === 'function') { return query(params, callback); }

  return new Promise((resolve, reject) => {
    query(params, (err, ezmesure) => {
      if (err) { return reject(err); }
      resolve(ezmesure);
    });
  });
};

exports.indexInsert = function (params, callback) {
  const service = 'api/logs';
  options.uri = encodeURI(`${params.baseUrl}/${service}/${params.index}`);
  options.method = 'POST';

  if (typeof callback === 'function') { return queryinsert(params, callback); }

  return new Promise((resolve, reject) => {
    queryinsert(params, (err, ezmesure) => {
      if (err) { return reject(err); }
      resolve(ezmesure);
    });
  });
};

exports.indexDelete = function (params, callback) {
  const service = 'api/logs';
  options.uri = encodeURI(`${params.baseUrl}/${service}/${params.index}`);
  options.method = 'DELETE';

  if (typeof callback === 'function') { return query(params, callback); }

  return new Promise((resolve, reject) => {
    query(params, (err, ezmesure) => {
      if (err) { return reject(err); }
      resolve(ezmesure);
    });
  });
};