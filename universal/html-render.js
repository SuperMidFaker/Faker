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
  <title>WeLogix</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="shortcut icon" href="${__CDN__}/assets/img/favicon.ico${tv}"/>
  <link rel="apple-touch-icon-precomposed" href="${__CDN__}/assets/img/apple-touch-icon-57x57-precomposed.png" />
  <link rel="apple-touch-icon-precomposed" href="${__CDN__}/assets/img/apple-touch-icon-72x72-precomposed.png" sizes="72x72" />
  <link rel="apple-touch-icon-precomposed" href="${__CDN__}/assets/img/apple-touch-icon-114x114-precomposed.png" sizes="114x114" />
  <link rel="apple-touch-icon-precomposed" href="${__CDN__}/assets/img/apple-touch-icon-144x144-precomposed.png" sizes="144x144" />
  <link rel="stylesheet" type="text/css" href="${__CDN__}/assets/lib/stroke-7/style.css" />
  <link rel="stylesheet" type="text/css" href="${__CDN__}/assets/lib/md-iconic-font/css/material-design-iconic-font.min.css">
  <link rel="stylesheet" type="text/css" href="${__CDN__}/assets/lib/jquery.nanoscroller/css/nanoscroller.css" />
  ${pageCss}
  <!--[if lt IE 10]>
    <script src="https://as.alipayobjects.com/g/component/??console-polyfill/0.2.2/index.js,es5-shim/4.1.14/es5-shim.min.js,es5-shim/4.1.14/es5-sham.min.js,html5shiv/3.7.2/html5shiv.min.js,media-match/2.0.2/media.match.min.js"></script>
  <![endif]-->
</head>
<body>
  <div id="mount" class="full-container">${content}</div>
  <script src="${__CDN__}/assets/lib/jquery/jquery.min.js" type="text/javascript"></script>
  <script src="${__CDN__}/assets/lib/jquery.nanoscroller/javascripts/jquery.nanoscroller.min.js" type="text/javascript"></script>
  ${pageJs}
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
