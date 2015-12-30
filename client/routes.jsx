import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import Root from './root';
import Home from './containers/home';
import SSO from './containers/pack-sso';
import Login from './containers/sso/login';
import Forgot from './containers/sso/forgot';
import Account from './containers/pack-account';
import * as Corp from './containers/account/corp';
import * as Personnel from './containers/account/personnel';
import Password from './containers/account/password';
import Module from './containers/module';
import WMS from './containers/module-wms';
import Warehouse from './containers/wms/warehouse';
import Customer from './containers/wms/customer';
import Bill from './containers/wms/bill';
import Notice from './containers/wms/notice';
import {loadAccount} from '../universal/redux/reducers/account';
import {isLoaded} from '../reusable/common/redux-actions';

/*
export default (
  <Route path="/" component={Root}>
    <IndexRoute component={Home} />
    <Route component={SSO}>
      <Route path="login" component={Login} />
      <Route path="forgot" component={Forgot} />
    </Route>
    <Route path="home" component={Home} />
    <Route path="account" component={Account}>
      <Route path="corp">
        <Route path="info" />
        <Route path="new" />
        <Route path="/:id/edit" />
      </Route>
      <Route path="corps" component={Corp.List} />
      <Route path="personnels" component={Personnel.List} />
      <Route path="password" component={Password} />
    </Route>
    <Route component={Module}>
      <Redirect from="wms" to="wms/warehouse" />
      <Route path="wms" component={WMS}>
        <Route path="warehouse" component={Warehouse} />
        <Route path="customer" component={Customer} />
        <Route path="bill" component={Bill} />
        <Route path="notice" component={Notice} />
      </Route>
    </Route>
  </Route>
);
*/
export default (store, cookie) => {
  const requireAuth = (nextState, replaceState, cb) => {
    function checkAuth() {
      const {account: {username}} = store.getState();
      console.log('checkAuth', username);
      if (username === '') {
        replaceState(null, `/login?next=${encodeURIComponent(nextState.location.pathname)}`);
      }
      cb();
    }
    if (!isLoaded(store.getState(), 'account')) {
      console.log('load account', cookie);
      store.dispatch(loadAccount(cookie)).then(checkAuth);
    } else {
      checkAuth();
    }
  };
  return (
    <Route path="/" component={Root}>
      <Route component={SSO}>
        <Route path="login" component={Login} />
        <Route path="forgot" component={Forgot} />
      </Route>
      <Route onEnter={requireAuth}>
        <IndexRoute component={Home} />
        <Route path="account" component={Account}>
          <Route path="corp">
            <Route path="info" />
            <Route path="new" />
            <Route path="/:id/edit" />
          </Route>
          <Route path="corps" component={Corp.List} />
          <Route path="personnels" component={Personnel.List} />
          <Route path="password" component={Password} />
        </Route>
        <Route component={Module}>
          <Redirect from="wms" to="wms/warehouse" />
          <Route path="wms" component={WMS}>
            <Route path="warehouse" component={Warehouse} />
            <Route path="customer" component={Customer} />
            <Route path="bill" component={Bill} />
            <Route path="notice" component={Notice} />
          </Route>
        </Route>
      </Route>
    </Route>
  );
};
