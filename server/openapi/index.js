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
import Response from '../../reusable/node-util/response';
import loadRoute from '../reusable/koa-middlewares/route-loader';
import verify from './verify';

const app = koa();

Response(app);

app.use(kLogger());
app.use(verify);

app.use(loadRoute(__dirname, 'apis'));

app.listen(process.env.PORT || 3023);
