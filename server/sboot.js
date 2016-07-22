/* eslint no-console:0 no-undef:0 */
if (process.env.NODE_ENV === 'production') {
  require('oneapm');
}

const argv = require('./util/minimist')(process.argv.slice(2));

const path = require('path');
process.env.NODE_PATH = path.resolve(__dirname, '..');
require('module').Module._initPaths();
require('babel/register')({
  stage: 0,
  blacklist: ['regenerator'],
});
console.time('starting web server');
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
