import React from 'react';
import ReactDom from 'react-dom';
import { browserHistory } from 'react-router';
import App from './app';
import configureStore from '../universal/redux/configureStore';
import { addLocaleData } from 'react-intl';
import { polyfill } from 'universal/i18n/helpers';
const store = configureStore(window.__INITIAL_STATE__);
polyfill(() => {
  addLocaleData(require('react-intl/locale-data/en'));
  addLocaleData(require('react-intl/locale-data/zh'));
  ReactDom.render(
    <App routerHistory={browserHistory} store={store} />,
    document.getElementById('mount')
  );
});
