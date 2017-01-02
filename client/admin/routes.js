import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import Root from './root';
import SSO from 'client/admin/sso/pack-sso';
import Login from 'client/admin/sso/login';
import PackAccount from 'client/apps/account/pack-account';
import MyProfile from 'client/apps/account/profile';
import Password from 'client/apps/account/password';
import ManagerPack from './packManager';
import Dashboard from './dashboard';
import * as Tenants from './tenants';
import { loadAccount } from 'common/reducers/account';
import { isLoaded } from 'client/common/redux-actions';
import { TENANT_LEVEL } from 'common/constants';

export default(store, cookie) => {
  const requireAuth = (nextState, replace, cb) => {
    function checkAuth() {
      const query = nextState.location.query;
      const { auth: { isAuthed }, account: { level } } = store.getState();
      if (!(isAuthed && level === TENANT_LEVEL.PLATFORM)) {
        const prevQuery = __DEV__ ? query : {};
        replace({
          pathname: '/login',
          query: {
            next: nextState.location.pathname,
            ...prevQuery,
          },
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
        <Route path="login" component={Login} />
      </Route>
      <Route onEnter={requireAuth}>
        <IndexRedirect to="/manager" />
        <Route path="account" component={PackAccount}>
          <Route path="profile" component={MyProfile} />
          <Route path="password" component={Password} />
        </Route>
        <Route path="manager" component={ManagerPack}>
          <IndexRoute component={Dashboard} />
          <Route path="tenants">
            <IndexRoute component={Tenants.List} />
            <Route path="create" component={Tenants.Create} />
            <Route path="edit/:id" component={Tenants.Edit} />
          </Route>
        </Route>
      </Route>
    </Route>
  );
};
