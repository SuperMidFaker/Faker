import path from 'path';
import fs from 'fs';
import koaRoute from 'koa-router';

// https://github.com/drGrove/koa-boilerplate/blob/master/routes/index.js
// https://github.com/koajs/api-boilerplate/blob/master/lib/load/index.js
export default function loadRoute(rootDir, route, prefix) {
  console.time(`load route ${route}`);
  const routeDir = path.resolve(rootDir, route);
  const kroute = koaRoute({ prefix: (prefix || '') });
  fs.readdirSync(routeDir).forEach((file) => {
    const fpath = path.resolve(routeDir, file);
    const status = fs.statSync(fpath);
    if (status.isFile()) {
      const routes = require(fpath);// path.join('..', route, file.substr(0, file.length - 3)));
      if (routes.length > 0) {
        routes.forEach(r => {
          if (r.length === 4) {
            kroute[r[0].toLowerCase()](r[3], r[1], r[2]);
          } else {
            kroute[r[0].toLowerCase()](r[1], r[2]);
          }
        });
      }
    }
  });
  console.timeEnd(`load route ${route}`);
  return kroute.routes();
}
