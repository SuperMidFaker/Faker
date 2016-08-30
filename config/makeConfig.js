import path from 'path';
const env = process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();
export default (serverPort, dirName, appName) => {
  const config = new Map();

  const __DEV__ = env === 'development' || env === 'home';
  const __TEST_PROD__ = env === 'test';
  const __PROD__ = env === 'production';
  // ------------------------------------
  // Environment
  // ------------------------------------
  config.set('app_name', appName);
  config.set('env', env);
  config.set('__DEVTOOLS__', env === 'development');
  config.set('__DEV__', __DEV__);
  config.set('__PROD__', __PROD__);

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
  config.set('webpack_admin_port', serverPort + 3);
  config.set('webpack_admin_path', `http://${config.get('server_host')}:${config.get('webpack_admin_port')}/`);
  config.set('webpack_admin_public_path', `${config.get('webpack_admin_path')}${config.get('webpack_dist')}/`);
  config.set('__PRODUCTIONS_ROOT_GROUP_ON_SERVER__', config.get('__PRODUCTIONS_ROOT_GROUP__'));
  config.set('CDN_URL', '');
  if (__DEV__) {
    config.set('webpack_public_path', `${config.get('webpack_dev_path')}${config.get('webpack_dist')}/`);
    // todo how to make the port configurable
    config.set('API_ROOTS', {
      default: 'http://localhost:3030/',
      mongo: 'http://localhost:3032/',
      self: '/',
    });
  }
  if (__TEST_PROD__) {
    config.set('webpack_public_path', `/${config.get('webpack_dist')}/`);
    config.set('API_ROOTS', {
      default: `http://192.168.0.200:${config.get('server_port')}/`,
      self: '/',
    });
  }
  if (__PROD__) {
    config.set('API_ROOTS', {
      default: 'https://api.welogix.cn/',
      mongo: 'https://api1.welogix.cn/',
      self: '/',
    });
    config.set('CDN_URL', 'https://welogix-web-cdn.b0.upaiyun.com');
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
