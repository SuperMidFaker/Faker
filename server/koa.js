import koa from 'koa';
import kLogger from 'koa-logger';
import kJwt from 'koa-jwt';
import assets from 'koa-static';
import fs from 'fs';
import path from 'path';
import loadRoute from '../reusable/koa-middlewares/route-loader';
import config from '../reusable/node-util/server.config';
import Result from '../reusable/node-util/response-result';
// import { ssoRedirectUrl } from '../reusable/node-util/redirection';

const app = koa();
var publicKey = fs.readFileSync(path.resolve(__dirname, '..', 'reusable', 'keys', 'qm.rsa.pub'));

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
    } else {
      throw e; // Pass the error to the next handler since it wasn't an auth error.
    }
  }
});

app.use(kLogger());
app.use(assets(path.resolve(__dirname, '..', 'public')));
// 页面路由在routes.jsx进行权限判断
app.use(loadRoute(__dirname, 'routes'));

// 受限API用户验证
app.use(kJwt(Object.assign({
  cookie: config.get('jwt_cookie_key'),
  secret: publicKey
}, config.get('jwt_crypt'))
).unless({
  custom: function skip() {
    return !!this.skipJwt;
  },
  path: [/^\/public/,/dist/, /assets/]
}));
app.use(loadRoute(__dirname, 'api'));

app.listen(__PORT__);
