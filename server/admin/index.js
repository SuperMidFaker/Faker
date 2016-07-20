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
import loadRoute from '../middlewares/route-loader';
import create from '../util/koaServer';

/* eslint-disable no-undef, no-console */
create({
  public: true,
  port: __PORT__,
  authError: true,
  middlewares: [
    loadRoute(__dirname, 'routes'),
  ],
});
console.log('server start to listen');
/* eslint-enable no-undef, no-console */
