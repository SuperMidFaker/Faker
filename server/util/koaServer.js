import koa from 'koa';
import kLogger from 'koa-logger';
import assets from 'koa-static';
import path from 'path';
import { isArray } from 'util';

import { koaJwtOptions } from './jwt-kit';
import Result, { patch } from './responseResult';
import io from 'socket.io';
const SOCKET_IO = require('../socket.io');
/**
 * create koa server with options
 * @param  {Object} options {
 *   prepare            // function for app prepare
 *   authError          // boolean for catch auth error
 *   public             // boolean for public folder
 *   jwt                // boolean for jwt auth
 *   middlewares        // array for app.use
 *   port               // number for listen port
 * }
 * @return {Object}         koa object
 */
export default function create(options) {
  const opts = options || {};
  const app = koa();

  patch(app);

  if (typeof opts.prepare === 'function') {
    opts.prepare(app);
  }

  if (opts.authError) {
    app.use(function *catchAuthError(next) {
      try {
        yield next; // Attempt to go through the JWT or App Validator
      } catch (e) {
        console.log(e.stack);
        if (e.status === 401) {
          Result.authError(this);
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
  }
  app.use(kLogger());
  if (opts.public) {
    app.use(assets(path.resolve(__dirname, '../..', 'public')));
  }
  if (opts.jwt) {
    // 受限API用户验证
    app.use(koaJwtOptions.unless({
      custom: function skip() {
        return !!this.skipJwt;
      },
      path: [/^\/public/, /dist/, /assets/]
    }));
  }
  if (opts.middlewares && isArray(opts.middlewares)) {
    opts.middlewares.forEach(m => app.use(m));
  }
  const server = require('http').createServer(app.callback());
  SOCKET_IO.initialize(io(server));
  if (opts.port) {
    // app.listen(opts.port);
    server.listen(opts.port);
  }

  return app;
}
