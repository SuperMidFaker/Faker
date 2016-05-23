import koa from 'koa';
import kLogger from 'koa-logger';
import assets from 'koa-static';
import fs from 'fs';
import path from 'path';
import authWeixin from '../reusable/koa-middlewares/weixin-auth';
import loadRoute from '../reusable/koa-middlewares/route-loader';
import { koaJwtOptions } from '../reusable/node-util/jwt-kit';
import Result from '../reusable/node-util/response-result';
// import { ssoRedirectUrl } from '../reusable/node-util/redirection';

const app = koa();

app.context.json = app.response.json = function json(obj) {
  this.charset = this.charset || 'utf-8';
  this.set('Content-Type', 'application/json; charset=' + this.charset);
  this.body = JSON.stringify(obj);
};

app.use(function *catchAuthError(next) {
  try {
    yield next; // Attempt to go through the JWT or App Validator
  } catch(e) {
    if (e.status === 401) {
      Result.Error(this, Result.HttpStatus.UNAUTHORIZED);
      // this.redirect(ssoRedirectUrl(this.request));
    } else if (e.status === 402) {
      this.json({
        code: e.code,
        msg: e.msg
      });
    } else if (e.status === 403) {
      this.json({
        code: 4003,
        msg: e.msg
      });
    } else {
      throw e; // Pass the error to the next handler since it wasn't an auth error.
    }
  }
});

app.use(kLogger());
app.use(assets(path.resolve(__dirname, '..', 'public')));
app.use(authWeixin());
// 页面路由在routes.jsx进行权限判断
console.time('load route');
app.use(loadRoute(__dirname, 'routes'));

// 受限API用户验证
app.use(koaJwtOptions.unless({
  custom: function skip() {
    return !!this.skipJwt;
  },
  path: [/^\/public/,/dist/, /assets/]
}));
app.use(loadRoute(__dirname, 'api'));
console.timeEnd('load route');

app.listen(__PORT__);
console.log('server start to listen');
