const argv = require('../reusable/node-util/minimist')(process.argv.slice(2));

const path = require('path');
process.env.NODE_PATH = path.resolve(__dirname, '..');
require('module').Module._initPaths();
require('babel/register')({
  stage: 0,
  blacklist: ['regenerator']
});
console.time('starting web server');
if (!isNaN(argv.port)) {
  process.env.PORT = parseInt(argv.port, 10);
}

if (argv.api) {
  require('./openapi');
} else {
  // https://github.com/visionmedia/superagent/issues/205
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  const config = require('../universal/config');
  const rootDir = config.get('project_root');
  var WebpackIsomorphicTools = require('webpack-isomorphic-tools');

  global.__CLIENT__ = false;
  global.__DEV__ = config.get('__DEV__');
  global.__PROD__ = config.get('__PROD__');
  global.__DEVTOOLS__ = config.get('__DEVTOOLS__');
  global.__PORT__ = config.get('server_port');
  global.__CDN__ = config.get('CDN_URL');
  global.__API_ROOT__ = `http://localhost:${__PORT__}/`;
  global.__PRODUCTIONS_ROOT_GROUP__ = config.get('__PRODUCTIONS_ROOT_GROUP_ON_SERVER__');
  global.__PRODUCTIONS_DOMAIN_GROUP__ = config.get('__PRODUCTIONS_DOMAIN_GROUP__');
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../reusable/webpack/isomorphic'))
    .development(__DEV__)
    .server(rootDir, function() {
      require('./koa');
      console.timeEnd('starting web server');
     });
}
