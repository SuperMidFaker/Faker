import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Root from './root';
import Home from './containers/home';
import SSO from './containers/pack-sso';
import Login from './containers/sso/login';
import Forgot from './containers/sso/forgot';
import Corp from './containers/pack-corp';
import CorpInfo from './containers/corp/info';
import PackOrganization from './containers/corp/pack-organization';
import * as Organization from './containers/corp/organization';
import * as Personnel from './containers/corp/personnel';
import * as Cooperation from './containers/corp/cooperation';
import Password from './containers/corp/password';
import Module from './containers/module';
import ImportM from './containers/module-import';
import ImportDashboard from './containers/import/dashboard';
import * as ImportDelegate from './containers/import/delegate';
import * as ImportTask from './containers/import/task';
import ExportM from './containers/module-export';
import ExportBoard from './containers/export/dashboard';
import * as ExportDelegate from './containers/export/delegate';
import TMS from './containers/module-tms';
import TMSDashboard from './containers/tms/dashboard';
import WMS from './containers/module-wms';
import Warehouse from './containers/wms/warehouse';
import Notice from './containers/wms/notice';
import { loadAccount } from '../universal/redux/reducers/account';
import { isLoaded } from '../reusable/common/redux-actions';

export default (store, cookie) => {
  const requireAuth = (nextState, replaceState, cb) => {
    function checkAuth() {
      /*
      const { account: { username, subdomain } } = store.getState();
      let querySubdomain;
      if (nextState.location.search) {
        // seems only enter in server side, we need check the search string
        // this callabck is blocking
        const query = require('query-string').parse(nextState.location.search.substring(1));
        querySubdomain = query && query.subdomain;
      }
      if (username === '' || (querySubdomain && querySubdomain !== subdomain)) {
        const search = __DEV__ ? `&${nextState.location.search.substring(1)}` : '';
        replaceState(null, `/login?next=${encodeURIComponent(nextState.location.pathname)}${search}`);
      }
     */
      const {auth: { isAuthed }} = store.getState();
      if (isAuthed) {
        const search = __DEV__ ? `&${nextState.location.search.substring(1)}` : '';
        replaceState(null, `/login?next=${encodeURIComponent(nextState.location.pathname)}${search}`);
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
        <Route path="forgot" component={Forgot} />
      </Route>
      <Route onEnter={requireAuth}>
        <IndexRoute component={Home} />
        <Route path="corp" component={Corp}>
          <Route path="info" component={CorpInfo} />
          <Route path="organization" component={PackOrganization}>
            <IndexRoute component={Organization.List} />
            <Route path="new" component={Organization.Edit} />
            <Route path="edit/:id" component={Organization.Edit} />
          </Route>
          <Route path="personnel">
            <IndexRoute component={Personnel.List} />
            <Route path="new" component={Personnel.Edit} />
            <Route path="edit/:id" component={Personnel.Edit} />
          </Route>
          <Route path="partners">
            <IndexRoute component={Cooperation.Partners} />
            <Route path="invitations/in" component={Cooperation.Received} />
            <Route path="invitations/out" component={Cooperation.Sent} />
          </Route>
          <Route path="password" component={Password} />
        </Route>
        <Route component={Module}>
          <Route path="import" component={ImportM}>
            <IndexRoute component={ImportDashboard} />
            <Route path="delegate">
              <IndexRoute component={ImportDelegate.List} />
              <Route path="new" component={ImportDelegate.Edit} />
              <Route path="edit/:id" component={ImportDelegate.Edit} />
            </Route>
            <Route path="passage">
              <IndexRoute component={ImportTask.List} />
            </Route>
          </Route>
          <Route path="export" component={ExportM}>
            <IndexRoute component={ExportBoard} />
            <Route path="delegate">
               <IndexRoute component={ExportDelegate.List} />
               <Route path="new" component={ExportDelegate.Edit}/>
               <Route path="edit/:id" component={ExportDelegate.Edit}/>
            </Route>
          </Route>
          <Route path="wms" component={WMS}>
            <IndexRoute component={Warehouse} />
            <Route path="warehouse" component={Warehouse} />
            <Route path="notice" component={Notice} />
          </Route>
          <Route path="tms" component={TMS}>
            <IndexRoute component={TMSDashboard} />
          </Route>
        </Route>
      </Route>
    </Route>
  );
};
