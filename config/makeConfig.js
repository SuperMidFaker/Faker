const path = require('path');
// const os = require('os');

process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();
const env = process.env.NODE_ENV;

// function getIp() {
//   let ip = '';
//   const ins = os.networkInterfaces();
//   Object.keys(ins).forEach((key) => {
//     const arr = ins[key];
//     arr.forEach((nin) => {
//       if (!nin.internal &&
//         nin.family.toLowerCase() === 'ipv4') {
//         ip = nin.address;
//       }
//     });
//   });
//   return ip;
// }

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
  let host = 'localhost';
  if (__TEST_PROD__) {
    // host = getIp();
    host = (process.env.HOST_IP || '127.0.0.1').trim();
  }
  config.set('server_port', serverPort);
  config.set('API_ROOTS', {// todo how to make the port configurable
    default: `http://${host}:3030/`,
    mongo: `http://${host}:3032/`,
    notify: `http://${host}:3100/`,
    self: '/',
    openapi: `http://${host}:3031/`,
  });

  // ------------------------------------
  // Webpack
  // ------------------------------------
  config.set('webpack_port', serverPort + 1);
  config.set('webpack_dist', 'dist');
  config.set('CDN_URL', '');
  config.set('XLSX_CDN', 'https://welogix-cdn.b0.upaiyun.com/xlsx');
  if (__DEV__) {
    config.set('webpack_public_path', `http://${host}:${config.get('webpack_port')}/${config.get('webpack_dist')}/`);
  }
  if (__TEST_PROD__) {
    config.set('API_ROOTS', {// todo how to make the port configurable
      default: `http://${host}:3030/`,
      mongo: `http://${host}:3032/`,
      notify: `http://${host}:3100/`,
      self: '/',
      openapi: `http://${host}:3031/`,
    });
    config.set('webpack_public_path', `/${config.get('webpack_dist')}/`);
  }
  if (__PROD__) {
    config.set('API_ROOTS', {
      default: 'https://api.welogix.cn/',
      mongo: 'https://api1.welogix.cn/',
      openapi: 'https://openapi.welogix.cn/',
      notify: 'https://notify.welogix.cn/',
      self: '/',
    });
    config.set('CDN_URL', 'https://pd-cdn.welogix.cn');
    config.set('webpack_public_path', `${config.get('CDN_URL')}/${config.get('webpack_dist')}/`);
    // config.set('webpack_public_path', `/${config.get('webpack_dist')}/`);
  }
  if (__STAGING__) {
    const domain = process.env.STAGING_DOMAIN || 'welogix.co';
    config.set('API_ROOTS', {
      default: `http://api.${domain}/`,
      mongo: `http://api1.${domain}/`,
      openapi: `https://openapi.${domain}/`,
      notify: `http://notify.${domain}/`,
      self: '/',
    });
    config.set('CDN_URL', 'http://st-cdn.welogix.co');
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
