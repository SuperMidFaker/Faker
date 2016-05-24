const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const wpConfig = require('./wpbase');
const config = require('../config');

wpConfig.entry.app = config.get('client_entry');

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

module.exports = wpConfig;
