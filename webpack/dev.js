const path = require('path');
const webpack = require('webpack');
const wpConfig = require('./wpbase');
const config = require('../config');

const args = process.argv;
if (args.length === 5 && args[4] === 'admin') {
  config.set('client_entry', 'client/admin/aboot.js');
}

wpConfig.entry.app = [
  'webpack/hot/dev-server',
  config.get('client_entry')
];

// Configuration for dev server
wpConfig.devServer = {
  contentBase: config.get('webpack_dev_path'),
  hot: true,
  quiet: true,
  // noInfo: true,
  inline: true,
  progress: true,
  stats: {
    colors: true
  },
  host: '0.0.0.0',
  port: config.get('webpack_port')
};
wpConfig.devtool = 'source-map';

wpConfig.plugins.push(
  new webpack.optimize.CommonsChunkPlugin({
    names: 'vendor',
    filename: '[name]-[hash].js',
    minChunks: Infinity
  }),
  new webpack.HotModuleReplacementPlugin() // sync with browser while developing
);
wpConfig.module.loaders.push({
  test: /\.less$/,
  loader: 'style!css?&sourceMap!postcss!less'
});

module.exports = wpConfig;
