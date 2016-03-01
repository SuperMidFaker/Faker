import renderHtml from '../../universal/html-render';
import config from '../../reusable/node-util/server.config';

export default [
   ['get', '/', plainRender],
   ['get', '/home', plainRender],
   ['get', '/login', plainRender],
   ['get', '/forgot', plainRender],
   ['get', '/corp/*', plainRender],
   ['get', '/wms*', plainRender],
   ['get', '/import*', plainRender],
   ['get', '/account/logout', logoutUser],
   ['get', '/export*', plainRender]
];

function *plainRender() {
  try {
    this.body = yield renderHtml(this.request);
  } catch (e) {
    console.log('wewms plain render cause ', e, e.stack);
    if (e.length === 2 && e[0] === 301) {
      this.redirect(e[1].pathname + e[1].search);
    }
  }
}

function *logoutUser() {
  this.cookies.set(config.get('jwt_cookie_key'), '', {
    httpOnly : __DEV__ ? false : true,
    domain: !__PROD__ ? undefined : config.get('jwt_cookie_domain')
  });
  this.redirect('/login');
}
