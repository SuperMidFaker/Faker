import codes from './codes';

const json = (resp, obj) => {
  resp.charset = resp.charset || 'utf-8';
  resp.set('Content-Type', `application/json; charset=${resp.charset}`);
  resp.body = JSON.stringify(obj);
};

module.exports = (app) => {
  app.context.ok = app.response.ok = function ok(obj) {
    json(this, codes.ok(obj));
  };

  app.context.forbidden = app.response.forbidden = function fbd(obj) {
    json(this, codes.forbidden(obj));
  };

  app.context.error = app.response.error = function err(obj, errMsg) {
    json(this, codes.error(obj, errMsg));
  };

  app.context.json = app.response.json = function js(obj) {
    json(this, obj);
  };

  app.context.nf = app.response.nf = function nf() {
    json(this, codes.notFound(codes.not_found));
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
