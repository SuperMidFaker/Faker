import koa from 'koa';
import kLogger from 'koa-logger';
import assets from 'koa-static';
import path from 'path';
import { isArray } from 'util';

import { patch } from './responseResult';
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

  app.use(kLogger());
  if (opts.public) {
    app.use(assets(path.resolve(__dirname, '../..', 'public')));
  }
  if (opts.middlewares && isArray(opts.middlewares)) {
    opts.middlewares.forEach(m => app.use(m));
  }
  if (opts.port) {
    app.listen(opts.port);
  }

  return app;
}
