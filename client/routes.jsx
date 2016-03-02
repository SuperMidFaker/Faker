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
import * as importDelegate from './containers/import/delegate';
import ExporT from './containers/module-export';
import * as exportdelegate from './containers/export/delegate';
import ImportDashboard from './containers/import/dashboard';
import TMS from './containers/module-tms';
import TMSDashboard from './containers/tms/dashboard';
import WMS from './containers/module-wms';
import Warehouse from './containers/wms/warehouse';
import Notice from './containers/wms/notice';
import { loadAccount } from '../universal/redux/reducers/account';
import { isLoaded } from '../reusable/common/redux-actions';
import * as importTask from './containers/import/task';

export default (store, cookie) => {
  const requireAuth = (nextState, replaceState, cb) => {
    function checkAuth() {
      const {account: {username}} = store.getState();
      if (username === '') {
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
            <Route path="new" component={Organization.Edit}/>
            <Route path="edit/:id" component={Organization.Edit} />
          </Route>
          <Route path="personnel">
            <IndexRoute component={Personnel.List} />
            <Route path="new" component={Personnel.Edit}/>
            <Route path="edit/:id" component={Personnel.Edit}/>
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
              <IndexRoute component={importDelegate.List} />
              <Route path="new" component={importDelegate.Edit} />
              <Route path="edit/:id" component={importDelegate.Edit} />
              <Route path="send/:id" component={importDelegate.Send} />
            </Route>
            <Route path="passage">
              <IndexRoute component={importTask.List} />

            </Route>
          </Route>
          <Route path="export" component={ExporT}>
            <Route path="delegate">
                <IndexRoute component={exportdelegate.List} />
                <Route path="new" component={exportdelegate.Edit}/>
                <Route path="edit/:id" component={exportdelegate.Edit}/>
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
