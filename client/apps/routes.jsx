import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import Root from './root';
import Home from './home';
import SSO from './sso/pack-sso';
import Login from './sso/login';
import Forgot from './sso/forgot';
import WeixinBinder from './weixin/binder';
import WxProfile from './weixin/profile';
import PackAccount from './account/pack-account';
import Corp from './corp/pack-corp';
import CorpInfo from './corp/info';
import MessageList from './account/messageList';
import PackOrganization from './corp/pack-organization';
import * as Organization from './corp/organization';
import * as Personnel from './corp/personnel';
import * as Cooperation from './corp/cooperation';
import MyProfile from './account/profile';
import Password from './account/password';
import Module from './module';
import Clearance from './cms/module-clearance';
import Transport from './transport/module-transport';
import TMSDashboard from './transport/dashboard';
import * as TMSAcceptance from './transport/acceptance';
import * as TMSDispatch from './transport/dispatch';
import * as TMSTracking from './transport/tracking';
import * as TMSResources from './transport/resources';
import * as TMSTariff from './transport/tariff';
import { loadAccount } from 'common/reducers/account';
import { isLoaded } from 'client/common/redux-actions';
import ImportWrapper from './cms/import/wrapper';
import * as ImportAcceptance from './cms/import/acceptance';
import * as ImportDeclare from './cms/import/declare';
import * as ImportManage from './cms/import/manage';
import * as ImportDelegate from './cms/import/delegate';
import * as WeiXinPod from './weixin/tms/pod';
import * as PublicTMS from './pub/tracking';
import WxLoadAccount from './weixin/loadAccount';
import WxTmsDetail from './weixin/tms/detail';
import ExportWrapper from './cms/export/wrapper';
import * as ExportAcceptance from './cms/export/acceptance';
import * as ExportDeclare from './cms/export/declare';
import * as ExportManage from './cms/export/manage';
import * as ExportDelegate from './cms/export/delegate';

// todo IndexRedirect passed nginx added subdomain
export default(store, cookie) => {
  const requireAuth = (nextState, replace, cb) => {
    function checkAuth() {
      const query = nextState.location.query;
      const { account: {
          subdomain,
        }, auth: {
          isAuthed,
        } } = store.getState();
      if (!isAuthed || (subdomain !== null && query && query.subdomain && query.subdomain !== subdomain)) {
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
      <Route path="pub">
        <Route path="tracking" component={PublicTMS.TrackingSearch} />
        <Route path="tms/tracking/detail/:shipmtNo/:key" component={PublicTMS.TrackingDetail} />
      </Route>
      <Route path="weixin">
        <Route path="bind" component={WeixinBinder} />
        <Route path="account" component={WxProfile} />
        <Route path="tms" component={WxLoadAccount}>
          <Route path="pod">
            <IndexRoute component={WeiXinPod.List} />
            <Route path="upload" component={WeiXinPod.UploadPod} />
            <Route path="uploadSucceed" component={WeiXinPod.UploadSucceed} />
          </Route>
          <Route path="detail/:shipmtNo/:sourceType" component={WxTmsDetail} />
        </Route>
      </Route>
      <Route component={SSO}>
        <Route path="login" component={Login} />
        <Route path="forgot" component={Forgot} />
      </Route>
      <Route onEnter={requireAuth}>
        <IndexRoute component={Home} />
        <Route path="account" component={PackAccount}>
          <Route path="profile" component={MyProfile} />
          <Route path="password" component={Password} />
          <Route path="messages" component={MessageList} />
        </Route>
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
        </Route>
        <Route component={Module}>
          <Route path="import" component={ImportWrapper}>
            <Route path="accept">
              <IndexRoute component={ImportAcceptance.List} />
              <Route path="create" component={ImportAcceptance.Create} />
              <Route path="edit/:delgNo" component={ImportAcceptance.Edit} />
            </Route>
            <Route path="declare">
              <IndexRedirect to="/import/declare/list/undeclared" />
              <Route path="list/:status" component={ImportDeclare.List} />
              <Route path="make/:delgNo" component={ImportDeclare.Make} />
              <Route path="view/:delgNo" component={ImportDeclare.View} />
            </Route>
            <Route path="manage" component={ImportManage.Menu}>
              <IndexRoute component={ImportManage.List} />
              <Route path="compRelation" component={ImportManage.List} />
              <Route path="create" component={ImportManage.Create} />
              <Route path="edit/:id" component={ImportManage.Edit} />
            </Route>
            <Route path="delegate">
              <IndexRoute component={ImportDelegate.List} />
              <Route path="create" component={ImportDelegate.Create} />
              <Route path="edit/:delgNo" component={ImportDelegate.Edit} />
            </Route>
          </Route>
          <Route path="export" component={ExportWrapper}>
            <Route path="accept">
              <IndexRoute component={ExportAcceptance.List} />
              <Route path="create" component={ExportAcceptance.Create} />
              <Route path="edit/:delgNo" component={ExportAcceptance.Edit} />
            </Route>
            <Route path="declare">
              <IndexRedirect to="/export/declare/list/undeclared" />
              <Route path="list/:status" component={ExportDeclare.List} />
              <Route path="make/:delgNo" component={ExportDeclare.Make} />
              <Route path="view/:delgNo" component={ExportDeclare.View} />
            </Route>
            <Route path="manage" component={ExportManage.Menu}>
              <IndexRoute component={ExportManage.List} />
              <Route path="compRelation" component={ExportManage.List} />
              <Route path="create" component={ExportManage.Create} />
              <Route path="edit/:id" component={ExportManage.Edit} />
            </Route>
            <Route path="delegate">
              <IndexRoute component={ExportDelegate.List} />
              <Route path="create" component={ExportDelegate.Create} />
              <Route path="edit/:delgNo" component={ExportDelegate.Edit} />
            </Route>
          </Route>
          <Route path="transport" component={Transport}>
            <IndexRoute component={TMSDashboard} />
            <Route path="shipment">
              <IndexRoute component={TMSAcceptance.List} />
              <Route path="new" component={TMSAcceptance.CreateNew} />
              <Route path="edit/:shipmt" component={TMSAcceptance.Edit} />
              <Route path="draft/:shipmt" component={TMSAcceptance.Draft} />
            </Route>
            <Route path="dispatch">
              <IndexRoute component={TMSDispatch.List} />
            </Route>
            <Route path="tracking">
              <IndexRedirect to="/transport/tracking/road/status/all" />
              <Route path="road" component={TMSTracking.LandWrapper}>
                <Route path="status/:state" component={TMSTracking.LandStatusList} />
                <Route path="pod/:state" component={TMSTracking.LandPodList} />
                <Route path="exception/:state" component={TMSTracking.LandExceptionList} />
              </Route>
            </Route>
            <Route path="resources">
              <IndexRoute component={TMSResources.MainContainer} />
              <Route path="add_car" component={TMSResources.VehicleFormContainer} />
              <Route path="edit_car/:car_id" component={TMSResources.VehicleFormContainer} />
              <Route path="add_driver" component={TMSResources.DriverFormContainer} />
              <Route path="edit_driver/:driver_id" component={TMSResources.DriverFormContainer} />
              <Route path="add_node" component={TMSResources.NodeFormContainer} />
              <Route path="edit_node/:node_id" component={TMSResources.NodeFormContainer} />
            </Route>
            <Route path="tariff">
              <IndexRoute component={TMSTariff.List} />
              <Route path="new" component={TMSTariff.CreateNew} />
              <Route path="edit/:uid" component={TMSTariff.Edit} />
            </Route>
          </Route>
          <Route path="clearance" component={Clearance}>
            <Route path="import">
              <IndexRoute component={ImportAcceptance.List} />
              <Route path="create" component={ImportAcceptance.Create} />
              <Route path="edit/:delgNo" component={ImportAcceptance.Edit} />
              <Route path="declare">
                <Route path="make/:billno" component={ImportDeclare.Make} />
                <Route path="view/:billno" component={ImportDeclare.View} />
              </Route>
            </Route>
            <Route path="export">
              <IndexRoute component={ExportAcceptance.List} />
              <Route path="edit/:delgNo" component={ExportAcceptance.Edit} />
            </Route>
          </Route>

        </Route>
      </Route>
    </Route>
  );
};
