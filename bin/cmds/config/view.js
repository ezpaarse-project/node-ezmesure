const { scopes } = require('../../../lib/config');

exports.command = 'view';
exports.desc = 'View current configuration';
exports.builder = {};
exports.handler = async function handler() {
  const { global, local } = scopes;

  console.log('[Global]');
  console.log(JSON.stringify(global.config || {}, null, 2));

  console.log('\n[Local]');
  console.log(JSON.stringify(local.config || {}, null, 2));
};
