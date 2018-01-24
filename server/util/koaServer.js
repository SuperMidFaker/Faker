const koa = require('koa');
const kLogger = require('koa-logger');
const assets = require('koa-static');
const path = require('path');
const { isArray } = require('util');
const { patch } = require('./responseResult');
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
module.exports = function create(options) {
  const opts = options || {};
  const app = koa();

  patch(app);

  if (typeof opts.prepare === 'function') {
    opts.prepare(app);
  }

  app.use(kLogger());
  if (opts.public) {
    app.use(assets(path.resolve(__dirname, '../..', 'public'), {
      maxage: 604800,
    }));
  }
  if (opts.middlewares && isArray(opts.middlewares)) {
    opts.middlewares.forEach(m => app.use(m));
  }
  if (opts.port) {
    app.listen(opts.port);
  }

  return app;
};
