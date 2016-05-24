const config = new Map();
config.set('jwt_crypt', { algorithm: 'RS256' });
config.set('jwt_expire_seconds', 30 * 24 * 60 * 60);
config.set('jwt_cookie_key', 'token');
config.set('jwt_cookie_domain', '.welogix.cn');

export default config;
