import fs from 'fs';
import path from 'path';
import kJwt from 'koa-jwt';
import config from '../../config/jwt.config';

const publicKey = fs.readFileSync(path.resolve(__dirname, '../../config', 'keys', 'qm.rsa.pub'));
const privateKey = fs.readFileSync(path.resolve(__dirname, '../../config', 'keys', 'qm.rsa'));

export function genJwtCookie(cookies, userId, userType, remember) {
  const claims = { userId, userType };
  const opts = Object.assign({}, config.get('jwt_crypt'), { expiresIn: config.get('jwt_expire_seconds') });
  // todo we should set a shorter interval for token expire, refresh it later
  const jwtoken = kJwt.sign(claims, privateKey, opts);
  const ONE_DAY = 24 * 60 * 60;
  cookies.set(config.get('jwt_cookie_key'), jwtoken, {
    httpOnly : __DEV__ ? false : true,
    expires: remember ? new Date(Date.now() + config.get('jwt_expire_seconds') * 1000) : new Date(Date.now() + ONE_DAY * 1000),
    domain: !__PROD__ ? undefined : config.get('jwt_cookie_domain')
  });
}

export function clearJwtCookie(cookies) {
  cookies.set(config.get('jwt_cookie_key'), '', {
    httpOnly : __DEV__ ? false : true,
    domain: !__PROD__ ? undefined : config.get('jwt_cookie_domain')
  });
}

export const koaJwtOptions = kJwt(
  Object.assign({
    cookie: config.get('jwt_cookie_key'),
    secret: publicKey
  }, config.get('jwt_crypt'))
);
