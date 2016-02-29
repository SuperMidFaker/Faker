const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const wpConfig = require('./wpbase');
const config = require('../universal/config');

wpConfig.entry = {
  // vendor: config.get('vendor_dependencies'),
  app: config.get('client_entry')
};

wpConfig.devtool = 'cheap-source-map',

wpConfig.plugins.push(
  // css files from the extract-text-plugin loader
  new ExtractTextPlugin('[name]-[chunkhash].css', {allChunks: true}),
  // new webpack.optimize.CommonsChunkPlugin('vendor', '[name]-[hash].js'), // optimizations
  new webpack.optimize.DedupePlugin(),
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
