import React from 'react';
import {Route, IndexRoute} from 'react-router';
import Root from './root';
import Home from './containers/home';
import SSO from './containers/pack-sso';
import Login from './containers/sso/login';
import Forgot from './containers/sso/forgot';
import WeixinBinder from './containers/weixin/binder';
import WxProfile from './containers/weixin/profile';
import PackAccount from './containers/pack-account';
import Corp from './containers/pack-corp';
import CorpInfo from './containers/corp/info';
import PackOrganization from './containers/corp/pack-organization';
import * as Organization from './containers/corp/organization';
import * as Personnel from './containers/corp/personnel';
import * as Cooperation from './containers/corp/cooperation';
import MyProfile from './containers/account/profile';
import Password from './containers/account/password';
import Module from './containers/module';
import ImportM from './containers/module-import';
import ImportDashboard from './containers/import/dashboard';
import * as ImportDelegate from './containers/import/delegate';
import * as ImportTask from './containers/import/task';
import * as ImportAccept from './containers/import/accept';
import ExportM from './containers/module-export';
import ExportBoard from './containers/export/dashboard';
import * as ExportDelegate from './containers/export/delegate';
import * as ExportAccept from './containers/export/accept';
import Transport from './containers/module-transport';
import TMSDashboard from './containers/transport/dashboard';
import * as TMShipment from './containers/transport/shipment';
import Inventory from './containers/module-inventory';
import Warehouse from './containers/inventory/warehouse';
import Notice from './containers/inventory/notice';
import { loadAccount } from '../universal/redux/reducers/account';
import { isLoaded } from '../reusable/common/redux-actions';
import * as ExportTask from './containers/export/task';
import * as ImportTracking from './containers/import/tracking';
import * as ExportTracking from './containers/export/tracking';

export default(store, cookie) => {
  const requireAuth = (nextState, replace, cb) => {
    function checkAuth() {
      const query = nextState.location.query;
      const { account: { subdomain }, auth: { isAuthed }} = store.getState();
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
            <Route path="receive">
              <IndexRoute component={ImportAccept.List}/>
              <Route path="new" component={ImportAccept.Edit}/>
              <Route path="edit/:id" component={ImportDelegate.Edit}/>
            </Route>
            <Route path="tracking">
              <IndexRoute component={ImportTracking.List}/>
            </Route>
          </Route>
          <Route path="export" component={ExportM}>
            <IndexRoute component={ExportBoard} />
            <Route path="delegate">
              <IndexRoute component={ExportDelegate.List}/>
              <Route path="new" component={ExportDelegate.Edit}/>
              <Route path="edit/:id" component={ExportDelegate.Edit}/>
              <Route path="exportsend/:status" component={ExportDelegate.Send}/>
            </Route>
            <Route path="receive">
              <IndexRoute component={ExportAccept.List}/>
              <Route path="new" component={ExportAccept.Edit}/>
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
            <Route path="shipment">
              <IndexRoute component={TMShipment.List}/>
              <Route path="new" component={TMShipment.CreateNew} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  );
};
