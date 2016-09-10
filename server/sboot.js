/* eslint no-console:0 no-undef:0 */
const path = require('path');
process.env.NODE_PATH = path.resolve(__dirname, '..');
require('module').Module._initPaths();
require('babel-register')({
  plugins: ['transform-decorators-legacy'],
  presets: ['es2015', 'react', 'stage-0'],
});
console.time('starting web server');

const argv = require('./util/minimist')(process.argv.slice(2));
if (!isNaN(argv.port)) {
  process.env.PORT = parseInt(argv.port, 10);
}

// https://github.com/visionmedia/superagent/issues/205
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const config = require('../config');
const rootDir = config.get('project_root');
const WebpackIsomorphicTools = require('webpack-isomorphic-tools');

global.__CLIENT__ = false;
global.__DEV__ = config.get('__DEV__');
global.__PROD__ = config.get('__PROD__');
global.__DEVTOOLS__ = config.get('__DEVTOOLS__');
global.__PORT__ = process.env.PORT || config.get('server_port');
global.__CDN__ = config.get('CDN_URL');
global.API_ROOTS = {
  default: 'http://localhost:3030/',
  mongo: 'http://localhost:3032/',
  self: `http://localhost:${__PORT__}/`,
};
const isomorphic = argv.admin ?
  require('../webpack/adminIsomorphic')
    : require('../webpack/isomorphic');
global.webpackIsomorphicTools = new WebpackIsomorphicTools(isomorphic)
  .development(__DEV__)
  .server(rootDir, () => {
    if (argv.admin) {
      require('./admin');
    } else {
      require('./web');
    }
    console.timeEnd('starting web server');
  });
