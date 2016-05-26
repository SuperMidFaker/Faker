import codes from './codes';
import Result, { patch } from '../util/responseResult';
/* eslint-disable no-param-reassign */

module.exports = (app) => {
  patch(app);

  app.context.ok = app.response.ok = function ok(obj) {
    Result.ok(this, obj);
  };

  app.context.forbidden = app.response.forbidden = function fbd(obj) {
    this.json(codes.forbidden(obj));
  };

  app.context.error = app.response.error = function err(obj, errMsg) {
    this.json(codes.error(obj, errMsg));
  };

  app.context.nf = app.response.nf = function nf() {
    this.json(codes.notFound(codes.not_found));
  };

  app.context.onerror = function onerror(err) {
    if (!err) return;

    if (!err.sql) {
      console.error(err.stack || err);
    }
    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (this.headerSent || !this.writable) {
      err.headerSent = true;
      return;
    }

    this.json(codes.error(codes.internal_server_error, err.message));

    this.status = 200;
    this.length = Buffer.byteLength(this.body);
    this.res.end(this.body);
  };
};
/* eslint-enable no-param-reassign */
