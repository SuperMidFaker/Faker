const path = require('path');
const config = require('./dev');

delete config.entry.app;

config.entry.admin = [
  'webpack/hot/dev-server',
  path.resolve(__dirname, '..', 'client/admin/aboot.js')
];

module.exports = config;
