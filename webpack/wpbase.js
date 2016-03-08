require('babel/register');

const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const WebpackIsomorphicPlugin = require('webpack-isomorphic-tools/plugin');
const config = require('../universal/config');
const isomorphicPlugin = new WebpackIsomorphicPlugin(require('../reusable/webpack/isomorphic'));
const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');

const wpConfig = {
  // Entry point to the project
  entry: {
  },
  context: path.resolve(__dirname, '..'),
  // Webpack config options on how to obtain modules
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: ['', '.js', '.jsx'],
    // Modules will be searched for in these directories
    root: path.resolve(__dirname, '..')
  },
  output: {
    path: config.get('output_path'), // Path of output file
    publicPath: config.get('webpack_public_path'),
    filename: '[name]-[hash].js'  // Name of output file
  },
  plugins: [
    new webpack.IgnorePlugin(/assets\.json$/),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __CDN__: JSON.stringify(config.get('CDN_URL')),
      __API_ROOT__: JSON.stringify(config.get('__API_ROOT__')),
      __PRODUCTIONS_ROOT_GROUP__: JSON.stringify(config.get('__PRODUCTIONS_ROOT_GROUP__')),
      __PRODUCTIONS_DOMAIN_GROUP__: JSON.stringify(config.get('__PRODUCTIONS_DOMAIN_GROUP__')),
      __DEVTOOLS__: config.get('__DEVTOOLS__'),
      __DEV__: config.get('__DEV__')
    }),
    config.get('__DEV__') ? isomorphicPlugin.development() : isomorphicPlugin
  ],
  module: {
    // eslint loader
    preLoaders: [{
      test: /\.(js|jsx)$/,
      loader: 'eslint-loader',
      include: [path.resolve(__dirname, '..', 'client'), path.resolve(__dirname, '..', 'universal')],
      exclude: [nodeModulesPath]
    }],
    loaders: [{
      test: /\.(js|jsx)$/, // All .js and .jsx files
      loader: 'babel', // babel loads jsx and es6-7
      include: [path.resolve(__dirname, '..', 'client'), path.resolve(__dirname, '..', 'universal'), path.resolve(__dirname, '..', 'reusable')],
      exclude: [nodeModulesPath],  // exclude node_modules so that they are not all compiled
      query: {
        optional: ['runtime'],
        stage: 0,
        blacklist: ['regenerator'],
        env: {
          development: {
            plugins: [
              'react-transform'
            ],
            extra: {
              'react-transform': {
                transforms: [{
                  transform: 'react-transform-hmr',
                  imports: ['react'],
                  locals:  ['module']
                }, {
                  transform: 'react-transform-catch-errors',
                  imports: ['react', 'redbox-react']
                }]
              }
            }
          },
          production: {
            plugins: ['react-intl'],
            extra: {
              'react-intl': {
                'messagesDir': './public/dist/messages/'
              }
            }
          }
        }
      }
    },
    { test: /\.json$/, loader: 'json-loader' },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
    // any image below or equal to 10K will be converted to inline base64 instead
    { test: isomorphicPlugin.regular_expression('images'), loader: 'url-loader?limit=10240' }]
  },
  postcss: function postcss() {
    return [autoprefixer];
  },
  eslint: {
    configFile: '.eslintrc',
    failOnError : false,
    emitWarning : true
  }
};

module.exports = wpConfig;
