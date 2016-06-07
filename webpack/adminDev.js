const path = require('path');
const wpConfig = require('./dev');
const config = require('../config');

delete wpConfig.entry.app;

wpConfig.entry.admin = [
  'webpack/hot/dev-server',
  path.resolve(__dirname, '..', 'client/admin/aboot.js'),
];

wpConfig.devServer.contentBase = config.get('webpack_admin_path');
wpConfig.devServer.port = config.get('webpack_admin_port');
wpConfig.output.publicPath = config.get('webpack_admin_public_path');

module.exports = wpConfig;
