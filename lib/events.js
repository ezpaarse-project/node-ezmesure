'use strict';

const { promisedQuery } = require('./util');

const services = {
  logs: '/logs'
};

exports.delete = function (index, options) {
  options = options || {};
  options.qs = options.qs || {};

  if (options.from) { options.qs.from = options.from; }
  if (options.to) { options.qs.to = options.to; }

  return promisedQuery('DELETE', `${services.logs}/${index}/events`, options).then(res => {
    if (res && res.hasOwnProperty('deleted')) { return res; }

    return Promise.reject(new Error('Invalid response'));
  });
};

