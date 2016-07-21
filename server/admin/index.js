/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-05-25
 * Time: 15:55
 * Version: 1.0
 * Description: admin
 */
import koaRoute from 'koa-router';
import create from '../util/koaServer';
import webRoutes from './routes/web.route';

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

/* eslint-disable no-undef, no-console */
create({
  public: true,
  port: __PORT__,
  authError: true,
  middlewares: [
    loadRoutes([...webRoutes]),
  ],
});
console.log('server start to listen');
/* eslint-enable no-undef, no-console */
