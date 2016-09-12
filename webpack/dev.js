const webpack = require('webpack');
const WebpackIsomorphicPlugin = require('webpack-isomorphic-tools/plugin');
const wpConfig = require('./wpbase');
const config = require('../config');
const isomorphicPlugin = new WebpackIsomorphicPlugin(require('./isomorphic'));

wpConfig.entry.app = [
  'webpack/hot/dev-server',
  config.get('client_entry'),
];

// Configuration for dev server
wpConfig.devServer = {
  contentBase: config.get('webpack_dev_path'),
  hot: true,
  quiet: true,
  inline: true,
  progress: true,
  stats: {
    colors: true,
  },
  host: '0.0.0.0',
  port: config.get('webpack_port'),
};
wpConfig.devtool = 'source-map';

wpConfig.plugins.push(
  new webpack.optimize.CommonsChunkPlugin({
    names: 'vendor',
    filename: '[name].js',
    minChunks: Infinity,
  }),
  new webpack.HotModuleReplacementPlugin() // sync with browser while developing
);
wpConfig.module.loaders.push({
  test: /\.less$/,
  loader: 'style!css?&sourceMap!postcss!less',
});

wpConfig.plugins.push(isomorphicPlugin.development());

wpConfig.module.loaders.push(
  // any image below or equal to 10K will be converted to inline base64 instead
  { test: isomorphicPlugin.regular_expression('images'), loader: 'url-loader?limit=10240' }
);

module.exports = wpConfig;
