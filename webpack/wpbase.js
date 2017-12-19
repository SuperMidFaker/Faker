/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HappyPack = require('happypack');
const config = require('../config');

const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');
const reactBabelProd = {
  plugins: [
    'transform-react-remove-prop-types',
    // 'transform-react-inline-elements', // https://github.com/babel/babel/issues/3728 Menu.Item
    // 'transform-react-constant-elements',  // https://github.com/babel/babel/issues/4458 error const {} = WeUI https://github.com/babel/babel/issues/4223 goods-info const opRendered
  ],
};

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
    filename: '[name].js', // Name of output file
  },
  plugins: [
    new HappyPack({
      loaders: [{
        path: 'babel',
        cacheDirectory: true,
        query: {
          env: {
            development: {
              presets: ['react-hmre'],
            },
            test: reactBabelProd,
            production: reactBabelProd,
          },
        },
      }],
    }),
    new webpack.IgnorePlugin(/assets\.json$/),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.ContextReplacementPlugin(/^\.\/locale$/, (context) => {
      // check if the context was created inside the moment package
      if (!/\/moment\//.test(context.context)) { return; }
      // context needs to be modified in place
      Object.assign(context, {
        // include only japanese, korean and chinese variants
        // all tests are prefixed with './' so this must be part of the regExp
        // the default regExp includes everything; /^$/ could be used to include nothing
        regExp: /^\.\/(en|zh-cn)/,
        // point to the locale data folder relative to moment/src/lib/locale
        request: '../../locale',
      });
    }),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __CDN__: JSON.stringify(config.get('CDN_URL')),
      XLSX_CDN: JSON.stringify(config.get('XLSX_CDN')),
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
      exclude: [nodeModulesPath], // exclude node_modules so that they are not all compiled
    },
    { test: /\.json$/, loader: 'json-loader' },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
    ],
  },
  postcss: () => [autoprefixer],
};

module.exports = wpConfig;
