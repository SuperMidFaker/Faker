import renderHtml from '../../universal/html-render';
import { clearJwtCookie } from '../../reusable/node-util/jwt-kit';

function *renderWebPage() {
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
  clearJwtCookie(this.cookies);
  this.redirect('/login');
}

export default [
   ['get', '/', renderWebPage],
   ['get', '/home', renderWebPage],
   ['get', '/login', renderWebPage],
   ['get', '/forgot', renderWebPage],
   ['get', '/corp/*', renderWebPage],
   ['get', '/wms*', renderWebPage],
   ['get', '/import*', renderWebPage],
   ['get', '/export*', renderWebPage],
   ['get', '/account/logout', logoutUser]
];
