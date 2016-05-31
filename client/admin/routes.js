import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Root from 'client/apps/root';
import Home from 'client/admin/home';
import SSO from 'client/apps/sso/pack-sso';
import Login from 'client/apps/sso/login';
import Forgot from 'client/apps/sso/forgot';
import PackAccount from 'client/apps/account/pack-account';
import MyProfile from 'client/apps/account/profile';
import Password from 'client/apps/account/password';
import {loadAccount} from 'common/reducers/account';
import {isLoaded} from 'client/common/redux-actions';
import Manager from './manager';

export default(store, cookie) => {
  const requireAuth = (nextState, replace, cb) => {
    function checkAuth() {
      const query = nextState.location.query;
      const {account: {
          subdomain
        }, auth: {
          isAuthed
        }} = store.getState();
      if (!isAuthed || (subdomain !== null && query && query.subdomain && query.subdomain !== subdomain)) {
        const prevQuery = __DEV__ ? query : {};
        replace({
          pathname: '/login',
          query: {
            next: nextState.location.pathname,
            ...prevQuery
          }
        });
      }
      cb();
    }
    if (!isLoaded(store.getState(), 'account')) {
      store.dispatch(loadAccount(cookie)).then(checkAuth);
    } else {
      checkAuth();
    }
  };
  return (
    <Route path="/" component={Root}>
      <Route component={SSO}>
        <Route path="login" component={Login}/>
        <Route path="forgot" component={Forgot}/>
      </Route>
      <Route onEnter={requireAuth}>
        <IndexRoute component={Home}/>
        <Route path="account" component={PackAccount}>
          <Route path="profile" component={MyProfile}/>
          <Route path="password" component={Password}/>
        </Route>
        <Route path="manager" component={Manager}/>
      </Route>
    </Route>
  );
};
