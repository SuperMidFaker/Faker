/* eslint no-undef:0 no-console:0 */
const koaRoute = require('koa-router');
const create = require('../util/koaServer');

// for webpack target node build explicit import
const webRoutes = require('./routes/web.route');
const apiRoutes = require('./routes/intl.api');

function loadRoutes(routes) {
  const kroute = koaRoute();
  if (routes.length > 0) {
    routes.forEach((r) => {
      if (r.length === 4) {
        kroute[r[0].toLowerCase()](r[3], r[1], r[2]);
      } else {
        kroute[r[0].toLowerCase()](r[1], r[2]);
      }
    });
  }
  return kroute.routes();
}

create({
  public: true,
  port: __PORT__,
  authError: true,
  middlewares: [
    loadRoutes([...webRoutes, ...apiRoutes]),
  ],
});
console.log('server start to listen');
