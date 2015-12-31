import React from 'react';
import ReactDom from 'react-dom/server';
import serialize from 'serialize-javascript';
import { match } from 'react-router';
import createLocation from 'history/lib/createLocation';
import createStore from './redux/configureStore';
import routes from '../client/routes';
import App from '../client/app';
import fetchInitialState from '../reusable/node-util/fetch-initial-state';

const tv = __DEV__ ? '' : `?${new Date().getTime()}`;
function renderAsHtml(pageCss, pageJs, content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>仓管家</title>
  <link rel="shortcut icon" href="${__CDN__}/assets/img/favicon.ico${tv}"/>
  <link rel="stylesheet" type="text/css" href="${__CDN__}/assets/lib/stroke-7/style.css" />
  <link rel="stylesheet" type="text/css" href="${__CDN__}/assets/lib/jquery.nanoscroller/css/nanoscroller.css" />
  ${pageCss}
</head>
<body>
  <div id="mount" class="full-container">${content}</div>
  <script src="${__CDN__}/assets/lib/jquery/jquery.min.js" type="text/javascript"></script>
  <script src="${__CDN__}/assets/lib/jquery.nanoscroller/javascripts/jquery.nanoscroller.min.js" type="text/javascript"></script>
  ${pageJs}
  <script>
  /*
    function hoverAmSubmenu() {
      // hacky: make the submenu ul visible at the bottom of page
      $('.am-sidebar-submenu').hover(function () {
        const submenu = $(this);
        const submenuUL = submenu.find('ul');
        if (submenu[0].offsetTop < window.innerHeight/2) {
          submenuUL.css('top', 0);
        } else {
          submenuUL.css('bottom', 0);
        }
      })
    }
    window.onpopstate = function (event) {
      if (event.state) {
        // history changed because of pushState/replaceState
        hoverAmSubmenu();
      }
    }

    $(window).on('hashchange', function(){
      hoverAmSubmenu();
    });
    var _wr = function(type) {
      var orig = history[type];
      return function() {
        var rv = orig.apply(this, arguments);
        setTimeout(function() {
          var e = new Event(type);
          e.arguments = arguments;
          window.dispatchEvent(e);
        }, 1000);
        return rv;
      };
    };
    history.pushState = _wr('pushState'), history.replaceState = _wr('replaceState');
    window.addEventListener('replaceState', function(e) {
      hoverAmSubmenu();
    });
    window.addEventListener('pushState', function(e) {
      hoverAmSubmenu();
    });
    $(document).ready(function() {
      hoverAmSubmenu();
      // todo if need the scroller, then wrap am-scroller nav-items div on AntMenu and  SubMenu
      // $('.am-scroller').nanoScroller();
    });
    */
  </script>
</body>
</html>`;
}

export default function render(request) {
  if (__DEV__) {
    webpackIsomorphicTools.refresh();
  }
  return new Promise((resolve, reject) => {
    const url = request.url;
    const location = createLocation(url);
    console.log(url, location);
    const store = createStore();
    const cookie = request.get('cookie');
    match({ routes: routes(store, cookie), location }, (err, redirection, props) => {
      if (err) {
        reject([500], err);
      } else if (redirection) {
        reject([301, redirection]);
      } else if (!props) {
        reject([404]);
      } else {
        fetchInitialState(props.components, store, cookie, props.location, props.params)
          .then( () => {
            const component = (<App routingContext = {props} store = {store} />);
            const content = ReactDom.renderToString(component);
            const assets = webpackIsomorphicTools.assets();
            let pageCss = '';
            Object.keys(assets.styles).map((style, i) => {
              pageCss += `<link href=${assets.styles[style]} rel="stylesheet" type="text/css" />`;
            });
            let pageJs = `
            <script>
            __INITIAL_STATE__ = ${serialize(store.getState())};
            </script>`;
            pageJs += assets.javascript.vendor ? `<script src=${assets.javascript.vendor}></script>` : '';
            Object.keys(assets.javascript).filter(script => script !== 'vendor')
            .map((script, i) => {
              pageJs += `<script src=${assets.javascript[script]}></script>`;
            });
            const htmls = renderAsHtml(pageCss, pageJs, content);
            resolve(htmls);
          }).catch( (e) => {
            reject(e);
          });
      }
    });
  });
}
