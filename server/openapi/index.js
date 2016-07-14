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

import create from '../util/koaServer';
import patch from './patch';
import loadRoute from '../middlewares/route-loader';
import verify from './verify';

const dispatch = loadRoute(__dirname, 'apis', '/v1');
const apis = {};
for (let i = 0; i < dispatch.router.stack.length; i++) {
  const r = dispatch.router.stack[i];
  apis[r.name || i] = r.path;
}
const port = process.env.PORT || 3023;
create({
  port,
  prepare: patch,
  middlewares: [
    verify,
    dispatch,
    function *nf() {
      return this.json(apis);
    }
  ]
});
console.log(`api start listen on ${port}`);
