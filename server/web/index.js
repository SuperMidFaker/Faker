/* eslint no-undef:0 no-console:0 */
import koaRoute from 'koa-router';
import create from '../util/koaServer';

// for webpack target node build explicit import
import webRoutes from './routes/web.route';
import wxRoutes from './routes/weixin.route';
import apiRoutes from './routes/intl.api';

function loadRoutes(routes) {
  const kroute = koaRoute();
  if (routes.length > 0) {
    routes.forEach(r => {
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
    loadRoutes([...webRoutes, ...wxRoutes, ...apiRoutes]),
  ],
});
console.log('server start to listen');
