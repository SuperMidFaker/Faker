/* eslint no-undef:0 no-console:0 */
import loadRoute from '../middlewares/route-loader';
import create from '../util/koaServer';
create({
  public: true,
  port: __PORT__,
  authError: true,
  middlewares: [
    // todo 如果需要服务端webpack生成,则将routes下面文件显示require
    loadRoute(__dirname, 'routes'),
  ],
});
console.log('server start to listen');
