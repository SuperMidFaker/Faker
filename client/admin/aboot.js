import React from 'react';
import ReactDom from 'react-dom';
import { browserHistory } from 'react-router';
import appWrapped from 'client/common/appWrapped';
import configureStore from 'common/adminReduxStore';

const store = configureStore(window.__INITIAL_STATE__);
if (__DEV__) {
  window.Perf = require('react/lib/ReactDefaultPerf');
}
const App = appWrapped(require('./routes'));
ReactDom.render(
  <App routerHistory={browserHistory} store={store} />,
  document.getElementById('mount')
);
