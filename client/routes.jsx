import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import Root from './apps/root';
import Home from './apps/home';
import SSO from './apps/sso/pack-sso';
import Login from './apps/sso/login';
import Forgot from './apps/sso/forgot';
import WeixinBinder from './apps/weixin/binder';
import WxProfile from './apps/weixin/profile';
import PackAccount from './apps/account/pack-account';
import Corp from './apps/corp/pack-corp';
import CorpInfo from './apps/corp/info';
import PackOrganization from './apps/corp/pack-organization';
import * as Organization from './apps/corp/organization';
import * as Personnel from './apps/corp/personnel';
import * as Cooperation from './apps/corp/cooperation';
import MyProfile from './apps/account/profile';
import Password from './apps/account/password';
import Module from './apps/module';
import ImportM from './apps/import/module-import';
import ImportDashboard from './apps/import/dashboard';
import * as ImportDelegate from './apps/import/delegate';
import * as ImportTask from './apps/import/task';
import * as ImportAccept from './apps/import/accept';
import * as ImportTracking from './apps/import/tracking';
import ExportM from './apps/export/module-export';
import ExportBoard from './apps/export/dashboard';
import * as ExportDelegate from './apps/export/delegate';
import * as ExportAccept from './apps/export/accept';
import * as ExportTask from './apps/export/task';
import * as ExportTracking from './apps/export/tracking';
import Transport from './apps/transport/module-transport';
import TMSDashboard from './apps/transport/dashboard';
import * as TMSAcceptance from './apps/transport/acceptance';
import * as TMSDispatch from './apps/transport/dispatch';
import * as TMSTracking from './apps/transport/tracking';
import * as TMSResources from './apps/transport/resources';
import Inventory from './apps/inventory/module-inventory';
import Warehouse from './apps/inventory/warehouse';
import Notice from './apps/inventory/notice';
import {loadAccount} from 'common/reducers/account';
import {isLoaded} from 'client/common/redux-actions';

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
      <Route path="weixin">
        <Route component={SSO}>
          <Route path="bind" component={WeixinBinder}/>
          <Route path="account" component={WxProfile}/>
        </Route>
      </Route>
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
        <Route path="corp" component={Corp}>
          <Route path="info" component={CorpInfo}/>
          <Route path="organization" component={PackOrganization}>
            <IndexRoute component={Organization.List}/>
            <Route path="new" component={Organization.Edit}/>
            <Route path="edit/:id" component={Organization.Edit}/>
          </Route>
          <Route path="personnel">
            <IndexRoute component={Personnel.List}/>
            <Route path="new" component={Personnel.Edit}/>
            <Route path="edit/:id" component={Personnel.Edit}/>
          </Route>
          <Route path="partners">
            <IndexRoute component={Cooperation.Partners}/>
            <Route path="invitations/in" component={Cooperation.Received}/>
            <Route path="invitations/out" component={Cooperation.Sent}/>
          </Route>
        </Route>
        <Route component={Module}>
          <Route path="import" component={ImportM}>
            <IndexRoute component={ImportDashboard}/>
            <Route path="delegate">
              <IndexRoute component={ImportDelegate.List}/>
              <Route path="new" component={ImportDelegate.Edit}/>
              <Route path="edit/:id" component={ImportDelegate.Edit}/>
              <Route path="send/:status" component={ImportDelegate.Send}/>
            </Route>
            <Route path="task">
              <IndexRoute component={ImportTask.List}/>
              <Route path="inputbill/:id" component={ImportTask.InputBill}/>
            </Route>
            <Route path="accept">
              <IndexRoute component={ImportAccept.List}/>
              <Route path="new" component={ImportAccept.Edit}/>
              <Route path="edit/:id" component={ImportAccept.Edit}/>
            </Route>
            <Route path="tracking">
              <IndexRoute component={ImportTracking.List}/>
            </Route>
          </Route>
          <Route path="export" component={ExportM}>
            <IndexRoute component={ExportBoard}/>
            <Route path="delegate">
              <IndexRoute component={ExportDelegate.List}/>
              <Route path="new" component={ExportDelegate.Edit}/>
              <Route path="edit/:id" component={ExportDelegate.Edit}/>
              <Route path="exportsend/:status" component={ExportDelegate.Send}/>
            </Route>
            <Route path="accept">
              <IndexRoute component={ExportAccept.List}/>
              <Route path="new" component={ExportAccept.Edit}/>
              <Route path="edit/:id" component={ExportAccept.Edit}/>
            </Route>
            <Route path="task">
              <IndexRoute component={ExportTask.List}/>
              <Route path="inputbill/:id" component={ExportTask.InputBill}/>
            </Route>
            <Route path="tracking">
              <IndexRoute component={ExportTracking.List}/>
            </Route>
          </Route>
          <Route path="inventory" component={Inventory}>
            <IndexRoute component={Warehouse}/>
            <Route path="warehouse" component={Warehouse}/>
            <Route path="notice" component={Notice}/>
          </Route>
          <Route path="transport" component={Transport}>
            <IndexRoute component={TMSDashboard}/>
            <Route path="acceptance">
              <IndexRoute component={TMSAcceptance.List}/>
              <Route path="shipment/new" component={TMSAcceptance.CreateNew} />
              <Route path="shipment/edit/:shipmt" component={TMSAcceptance.Edit} />
              <Route path="shipment/draft/:shipmt" component={TMSAcceptance.Draft} />
            </Route>
            <Route path="dispatch">
              <IndexRoute component={TMSDispatch.List}/>
            </Route>
            <Route path="tracking">
              <IndexRedirect to="/transport/tracking/land/shipmt/status/all" />
              <Route path="land" component={TMSTracking.Menu}>
                <Route path="shipmt" component={TMSTracking.LandWrapper}>
                  <Route path="status/:state" component={TMSTracking.LandStatusList} />
                  <Route path="pod/:state" component={TMSTracking.LandPodList} />
                  <Route path="exception/:state" component={TMSTracking.LandExceptionList} />
                </Route>
              </Route>
              <Route path="air" component={TMSTracking.Menu} />
              <Route path="express" component={TMSTracking.Menu} />
            </Route>
            <Route path="resources">
              <IndexRoute component={TMSResources.MainContainer} />
              <Route path="add_car" component={TMSResources.CarFormContainer} />
              <Route path="edit_car/:car_id" component={TMSResources.CarFormContainer} />
              <Route path="add_driver" component={TMSResources.DriverFormContainer} />
              <Route path="edit_driver/:driver_id" component={TMSResources.DriverFormContainer} />
              <Route path="add_node" component={TMSResources.NodeFormContainer} />
              <Route path="edit_node/:node_id" component={TMSResources.NodeFormContainer} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  );
};
