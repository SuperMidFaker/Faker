import React from 'react';
import ReactDom from 'react-dom';
import createHistory from 'history/lib/createBrowserHistory';
import App from './app';
import configureStore from '../universal/redux/configureStore';
const store = configureStore(window.__INITIAL_STATE__);
ReactDom.render(
  <App routerHistory={createHistory()} store={store} />,
  document.getElementById('mount')
);
