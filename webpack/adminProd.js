const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackIsomorphicPlugin = require('webpack-isomorphic-tools/plugin');
const wpConfig = require('./wpbase');
const config = require('../config');
const isomorphicPlugin = new WebpackIsomorphicPlugin(require('./adminIsomorphic'));

wpConfig.entry.admin = path.resolve(__dirname, '..', 'client/admin/aboot.js');
wpConfig.devtool = 'cheap-source-map';

// https://github.com/webpack/webpack/issues/1315 make hash not change
wpConfig.output.filename = '[name].[chunkhash].js';
wpConfig.output.chunkFilename = '[chunkhash].js';

wpConfig.plugins.push(
  // css files from the extract-text-plugin loader
  new ExtractTextPlugin('[name]-[chunkhash].css', {allChunks: true}),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor', 'manifest']
  }),
  new webpack.NamedModulesPlugin(),
  // https://github.com/webpack/webpack/issues/959#issuecomment-155552808
  // new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
        // Useful to reduce the size of client-side libraries, e.g. react
        NODE_ENV: JSON.stringify('production')
      }
    }),

  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
);

wpConfig.module.loaders.push({
  test: /\.less$/,
  loader: ExtractTextPlugin.extract('style', 'css?&sourceMap!postcss!less')
});

wpConfig.plugins.push(isomorphicPlugin);

wpConfig.module.loaders.push(
  // any image below or equal to 10K will be converted to inline base64 instead
  { test: isomorphicPlugin.regular_expression('images'), loader: 'url-loader?limit=10240' }
);

module.exports = wpConfig;
