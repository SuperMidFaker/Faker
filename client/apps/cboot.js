import React from 'react';
import ReactDom from 'react-dom';
import { browserHistory } from 'react-router';
import appWrapped from 'client/common/appWrapped';
import configureStore from 'common/webReduxStore';
import { addLocaleData } from 'react-intl';
import { polyfill } from 'client/common/i18n/helpers';

const store = configureStore(window.__INITIAL_STATE__);
const App = appWrapped(require('./routes'));
polyfill(() => {
  addLocaleData(require('react-intl/locale-data/en'));
  addLocaleData(require('react-intl/locale-data/zh'));
  ReactDom.render(
    <App routerHistory={browserHistory} store={store} />,
    document.getElementById('mount')
  );
});
