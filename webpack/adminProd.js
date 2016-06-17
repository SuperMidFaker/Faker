const path = require('path');
const wpConfig = require('./prod');

delete wpConfig.entry.app;

wpConfig.entry.admin = [
  path.resolve(__dirname, '..', 'client/admin/aboot.js'),
];

module.exports = wpConfig;
