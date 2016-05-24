import path from 'path';
const env = process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();
export default (server_port, dirName, appName) => {
  const config = new Map();

  const __DEV__ = env === 'development' || env === 'home';;
  const __TEST_PROD__ = env === 'test';
  const __PROD__ = env === 'production';
  // ------------------------------------
  // Environment
  // ------------------------------------
  config.set('env', env);
  config.set('__DEVTOOLS__', env === 'development');
  config.set('__DEV__', __DEV__);
  config.set('__PROD__', __PROD__);

  // ------------------------------------
  // Server
  // ------------------------------------
  config.set('server_host', 'localhost');
  config.set('server_port', server_port);

  // ------------------------------------
  // Webpack
  // ------------------------------------
  config.set('webpack_port', server_port + 1);
  config.set('webpack_dev_path', `http://${config.get('server_host')}:${config.get('webpack_port')}/`);
  config.set('webpack_dist', 'dist');
  config.set('CDN_URL', '');
  config.set('__API_ROOT__', `http://${config.get('server_host')}:${config.get('server_port')}/`);
  // todo how to make the port configurable
  config.set('__PRODUCTIONS_ROOT_GROUP__', {
    'sso': `http://${config.get('server_host')}:3020/`,
    'wewms': `http://${config.get('server_host')}:3024/`
  });
  config.set('__PRODUCTIONS_ROOT_GROUP_ON_SERVER__', config.get('__PRODUCTIONS_ROOT_GROUP__'));
  if (__DEV__) {
    config.set('webpack_public_path', `${config.get('webpack_dev_path')}${config.get('webpack_dist')}/`);
  }
  if (__TEST_PROD__) {
    config.set('webpack_public_path', `/${config.get('webpack_dist')}/`);
    config.set('__API_ROOT__', `http://192.168.0.200:${config.get('server_port')}/`);
    config.set('__PRODUCTIONS_ROOT_GROUP__', {
      'sso': 'http://192.168.0.200:3020/',
      'wewms': 'http://192.168.0.200:3024/'
    });
  }
  if (__PROD__) {
    config.set('__PRODUCTIONS_ROOT_GROUP__', {
      'welogix': 'http://test.welogix.cn/',
      'sso': 'http://sso.wetms.com/',
      'wewms': 'http://wms.wetms.com/'
    });
    config.set('__API_ROOT__', '/');
    // config.set('CDN_URL', 'http://welogix-web-cdn.b0.upaiyun.com');
    config.set('CDN_URL', 'http://s.welogix.cn');
    config.set('webpack_public_path', `${config.get('CDN_URL')}/${config.get('webpack_dist')}/`);
  }
  config.set('__PRODUCTIONS_DOMAIN_GROUP__', config.get('__PRODUCTIONS_ROOT_GROUP__'));
  config.set('output_path', path.resolve(dirName, '..', 'public', config.get('webpack_dist')));

  config.set('webpack_lint_in_dev', true);

  // ------------------------------------
  // Project
  // ------------------------------------
  config.set('project_root', path.resolve(dirName, '..'));
  config.set('client_entry', path.resolve(dirName, '..', 'client/cboot.js'));

  return config;
}
