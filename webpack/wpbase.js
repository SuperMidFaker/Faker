const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const config = require('../config');
const HappyPack = require('happypack');

const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');

const wpConfig = {
  // Entry point to the project
  entry: {
    vendor: config.get('vendor_dependencies'),
  },
  context: path.resolve(__dirname, '..'),
  // Webpack config options on how to obtain modules
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: ['', '.js', '.jsx'],
    // Modules will be searched for in these directories
    root: path.resolve(__dirname, '..'),
  },
  output: {
    path: config.get('output_path'), // Path of output file
    publicPath: config.get('webpack_public_path'),
    filename: '[name].js',  // Name of output file
  },
  plugins: [
    new HappyPack({
      loaders: [{
        path: 'babel',
        query: {
          plugins: ['transform-decorators-legacy'],
          presets: ['es2015', 'react', 'stage-0'],
          env: {
            development: {
              presets: ['react-hmre'],
            },
            production: {
              plugins: [
                'transform-react-remove-prop-types',
                'transform-react-inline-elements',
                'transform-react-constant-elements',
              ],
            },
          },
        },
      }],
    }),
    new webpack.IgnorePlugin(/assets\.json$/),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __CDN__: JSON.stringify(config.get('CDN_URL')),
      API_ROOTS: JSON.stringify(config.get('API_ROOTS')),
      __DEVTOOLS__: config.get('__DEVTOOLS__'),
      __DEV__: config.get('__DEV__'),
    }),
  ],
  module: {
    loaders: [{
      test: /\.(js|jsx)$/, // All .js and .jsx files
      loader: 'happypack/loader', // babel loads jsx and es6-7
      include: [path.resolve(__dirname, '..', 'client'), path.resolve(__dirname, '..', 'common')],
      exclude: [nodeModulesPath],  // exclude node_modules so that they are not all compiled
    },
    { test: /\.json$/, loader: 'json-loader' },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
    ],
  },
  postcss: function postcss() {
    return [autoprefixer];
  },
};

module.exports = wpConfig;
