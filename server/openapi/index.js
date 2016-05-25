/**
 * Copyright (c) 2012-2015 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-16
 * Time: 14:22
 * Version: 1.0
 * Description:
 */

import koa from 'koa';
import kLogger from 'koa-logger';
import patch from './patch';
import loadRoute from '../middlewares/route-loader';
import verify from './verify';

const app = koa();

patch(app);

app.use(kLogger());
app.use(verify);

const dispatch = loadRoute(__dirname, 'apis', '/v1');
const apis = {};
for (let i = 0; i < dispatch.router.stack.length; i++) {
  const r = dispatch.router.stack[i];
  if (r.name) {
    apis[r.name] = r.path;
  }
}
app.use(dispatch);

app.use(function *nf() {
  return this.json(apis);
});

const port = process.env.PORT || 3023;
// if (!isNaN(process.env.PORT)) {
//   port = parseInt(process.env.PORT, 10);
// }

app.listen(port);
console.log(`api start listen on ${port}`);
