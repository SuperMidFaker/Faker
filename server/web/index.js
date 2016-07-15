import authWeixin from '../middlewares/weixin-auth';
import loadRoute from '../middlewares/route-loader';
import { koaJwtOptions } from '../util/jwt-kit';
import create from '../util/koaServer';
/* eslint-disable no-undef */
create({
  public: true,
  port: __PORT__,
  authError: true,
  middlewares: [
    authWeixin(),
    loadRoute(__dirname, 'routes'),
    koaJwtOptions.unless({
      custom: function skip() {
        return !!this.skipJwt;
      },
      path: [/^\/public/, /dist/, /assets/],
    }),
    loadRoute(__dirname, '../api'),
  ],
});
/* eslint-enable no-undef */
console.log('server start to listen');
