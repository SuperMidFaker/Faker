// https://github.com/visionmedia/superagent/issues/205
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const config = require('../config');
if (config.get('__PROD__')) {
  require('oneapm');
}

const argv = require('./util/minimist')(process.argv.slice(2));

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
  const rootDir = config.get('project_root');
  const WebpackIsomorphicTools = require('webpack-isomorphic-tools');

  global.__CLIENT__ = false;
  global.__DEV__ = config.get('__DEV__');
  global.__PROD__ = config.get('__PROD__');
  global.__DEVTOOLS__ = config.get('__DEVTOOLS__');
  global.__PORT__ = process.env.PORT || config.get('server_port');
  global.__CDN__ = config.get('CDN_URL');
  /* eslint-disable no-undef */
  global.__API_ROOT__ = `http://localhost:${__PORT__}/`;
  /* eslint-enable no-undef */
  global.__PRODUCTIONS_ROOT_GROUP__ = config.get('__PRODUCTIONS_ROOT_GROUP_ON_SERVER__');
  global.__PRODUCTIONS_DOMAIN_GROUP__ = config.get('__PRODUCTIONS_DOMAIN_GROUP__');
  const sequelize = require('./models/sequelize');
  sequelize.authenticate().then(() => {
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
  }).catch(err => {
    console.log('connect to mysql database failed:', err);
  });
}
