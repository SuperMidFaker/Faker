const path = require('path');
process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();
const env = process.env.NODE_ENV;
module.exports = (serverPort, dirName, appName) => {
  const config = new Map();

  const __DEV__ = env === 'development' || env === 'home';
  const __TEST_PROD__ = env === 'test';
  const __PROD__ = env === 'production';
  const __STAGING__ = env === 'staging';
  // ------------------------------------
  // Environment
  // ------------------------------------
  config.set('app_name', appName);
  config.set('env', env);
  config.set('__DEVTOOLS__', env === 'development');
  config.set('__DEV__', __DEV__);
  config.set('__PROD__', __PROD__ || __STAGING__); // server rendering subdomain

  // ------------------------------------
  // Server
  // ------------------------------------
  config.set('server_host', 'localhost');
  config.set('server_port', serverPort);

  // ------------------------------------
  // Webpack
  // ------------------------------------
  config.set('webpack_port', serverPort + 1);
  config.set('webpack_dev_path', `http://${config.get('server_host')}:${config.get('webpack_port')}/`);
  config.set('webpack_dist', 'dist');
  config.set('CDN_URL', '');
  config.set('XLSX_CDN', 'https://welogix-cdn.b0.upaiyun.com/xlsx');
  if (__DEV__) {
    config.set('webpack_public_path', `${config.get('webpack_dev_path')}${config.get('webpack_dist')}/`);
    // todo how to make the port configurable
    config.set('API_ROOTS', {
      default: 'http://localhost:3030/',
      mongo: 'http://localhost:3032/',
      scv: 'http://localhost:3034/',
      notify: 'http://localhost:3100/',
      self: '/',
    });
  }
  if (__TEST_PROD__) {
    config.set('webpack_public_path', `/${config.get('webpack_dist')}/`);
    config.set('API_ROOTS', {
      default: 'http://localhost:3030/',
      mongo: 'http://localhost:3032/',
      scv: 'http://localhost:3034/',
      notify: 'http://localhost:3100/',
      self: '/',
    });
  }
  if (__PROD__) {
    config.set('API_ROOTS', {
      default: 'https://api.welogix.cn/',
      mongo: 'https://api1.welogix.cn/',
      scv: 'https://api2.welogix.cn/',
      notify: 'https://notify.welogix.cn/',
      self: '/',
    });
    config.set('CDN_URL', 'https://welogix-web-cdn.b0.upaiyun.com');
    config.set('webpack_public_path', `${config.get('CDN_URL')}/${config.get('webpack_dist')}/`);
    // config.set('webpack_public_path', `/${config.get('webpack_dist')}/`);
  }
  if (__STAGING__) {
    config.set('API_ROOTS', {
      default: 'http://api.welogix.co/',
      mongo: 'http://api1.welogix.co/',
      scv: 'http://api2.welogix.co/',
      notify: 'http://notify.welogix.co/',
      self: '/',
    });
    config.set('CDN_URL', 'http://staging-cdn.welogix.co');
    config.set('webpack_public_path', `${config.get('CDN_URL')}/${config.get('webpack_dist')}/`);
    // config.set('webpack_public_path', `/${config.get('webpack_dist')}/`);
  }
  config.set('output_path', path.resolve(dirName, '..', 'public', config.get('webpack_dist')));

  // ------------------------------------
  // Project
  // ------------------------------------
  config.set('project_root', path.resolve(dirName, '..'));
  config.set('client_entry', path.resolve(dirName, '..', 'client/apps/cboot.js'));

  return config;
};
