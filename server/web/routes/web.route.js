/* eslint no-console:0 */
import renderHtml from '../htmlRender';

function renderWebPage() {
  try {
    this.body = renderHtml(this.request/* , this.cookies.get('locale') */);
  } catch (e) {
    console.log('welogix plain render cause ', e, e.stack);
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
   ['get', '/cwm*', renderWebPage],
   ['get', '/bss*', renderWebPage],
   ['get', '/scof*', renderWebPage],
   ['get', '/scv*', renderWebPage],
   ['get', '/my*', renderWebPage],
   ['get', '/pub/*', renderWebPage],
   ['get', '/hub*', renderWebPage],
];
