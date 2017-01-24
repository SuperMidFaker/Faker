/* eslint no-console:0 */
import renderHtml from '../htmlRender';

function* renderWebPage() {
  try {
    this.body = yield renderHtml(this.request, this.cookies.get('locale'));
  } catch (e) {
    console.log('wewms plain render cause ', e, e.stack);
    if (e.length === 2 && e[0] === 301) {
      this.redirect(e[1].pathname + e[1].search);
    }
  }
}

export default [
   ['get', '/', renderWebPage],
   ['get', '/home', renderWebPage],
   ['get', '/login', renderWebPage],
   ['get', '/forgot', renderWebPage],
   ['get', '/corp*', renderWebPage],
   ['get', '/transport*', renderWebPage],
   ['get', '/clearance*', renderWebPage],
   ['get', '/warehousing*', renderWebPage],
   ['get', '/customer*', renderWebPage],
   ['get', '/scv*', renderWebPage],
   ['get', '/my*', renderWebPage],
   ['get', '/message*', renderWebPage],
   ['get', '/pub/*', renderWebPage],
];
