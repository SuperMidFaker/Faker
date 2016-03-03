import React from 'react';
import ReactDom from 'react-dom';
import createHistory from 'history/lib/createBrowserHistory';
import App from './app';
import configureStore from '../universal/redux/configureStore';
import { addLocaleData } from 'react-intl';
import { polyfill } from 'universal/i18n/helpers';
const store = configureStore(window.__INITIAL_STATE__);
addLocaleData(store.getState().intl.langCLDR);
polyfill(() => {
  ReactDom.render(
    <App routerHistory={createHistory()} store={store} />,
    document.getElementById('mount')
  );
});
