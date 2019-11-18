
const { promisedQuery } = require('./util');

const services = {
  depositors: '/partners',
};

exports.refresh = function refresh(options) {
  return promisedQuery('POST', `${services.depositors}/refresh`, options).then((res) => {
    if (res && res.items) { return res; }

    return Promise.reject(new Error('Invalid response'));
  });
};
