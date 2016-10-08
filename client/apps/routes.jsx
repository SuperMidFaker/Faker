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
import MessageList from './account/messageList';
import MyProfile from './account/profile';
import Password from './account/password';
import Corp from './corp/pack-corp';
import CorpOverview from './corp/overview';
import CorpInfo from './corp/info';
import * as Organization from './corp/organization';
import * as Personnel from './corp/personnel';
import * as Cooperation from './corp/cooperation';
import * as Role from './corp/role';
import Module from './module';
import Transport from './transport/module-transport';
import * as TMSDashboard from './transport/dashboard';
import * as TMSAcceptance from './transport/acceptance';
import * as TMSDispatch from './transport/dispatch';
import * as TMSTracking from './transport/tracking';
import * as TMSResources from './transport/resources';
import * as TMSBilling from './transport/billing';
import * as TMSTariff from './transport/tariff';
import * as WeiXinPod from './weixin/tms/pod';
import * as PublicTMS from './pub/tracking';
import * as Template from './pub/template';
import WxLoadAccount from './weixin/loadAccount';
import WxTmsDetail from './weixin/tms/detail';
import Clearance from './cms/module-clearance';
import * as ImportDelegation from './cms/import/delegation';
import * as ImportDocs from './cms/import/docs';
import * as ExportDelegation from './cms/export/delegation';
import * as ExportDocs from './cms/export/docs';
import * as CMSRelation from './cms/relation';
import * as CMSQuote from './cms/quote';
import * as CMSSettings from './cms/settings';
import SCV from './scv/module-scv';
import * as SCVDashboard from './scv/dashboard';
import * as SCVOrders from './scv/orders';
import * as SCVInbound from './scv/inbounds';
import * as SCVOutbound from './scv/outbounds';
import * as SCVPaymentsTax from './scv/payments/tax';
import * as SCVPaymentsBilling from './scv/payments/billing';
import * as SCVAnalyticsKpi from './scv/analytics/kpi';
import * as SCVAnalyticsCost from './scv/analytics/cost';
import * as SCVSettings from './scv/settings';
import CRM from './crm/module-crm';
import * as CRMDashboard from './crm/dashboard';
import * as CRMOrders from './crm/orders';
import { loadAccount } from 'common/reducers/account';
import { isLoaded } from 'client/common/redux-actions';
import { DEFAULT_MODULES } from 'common/constants/module';

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
        <Route path="template">
          <Route path="shipment">
            <Route path="detail/:shipmtNo/:key" component={Template.ShipmentDetail} />
            <Route path="pod/:shipmtNo/:podId/:key" component={Template.ShipmentPod} />
          </Route>
        </Route>
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
        <Route path="my" component={PackAccount}>
          <Route path="profile" component={MyProfile} />
          <Route path="password" component={Password} />
          <Route path="messages" component={MessageList} />
        </Route>
        <Route path="corp" component={Corp}>
          <IndexRedirect to="/corp/overview" />
          <Route path="overview" component={CorpOverview} />
          <Route path="info" component={CorpInfo} />
          <Route path="organization" component={Organization.Wrapper}>
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
          <Route path="role" component={Role.Wrapper}>
            <IndexRoute component={Role.List} />
            <Route path="new" component={Role.Create} />
            <Route path="edit/:id" component={Role.Edit} />
          </Route>
        </Route>
        <Route component={Module}>
          <Route path={DEFAULT_MODULES.transport.id} component={Transport}>
            <Route path="dashboard">
              <IndexRoute component={TMSDashboard.Index} />
              <Route path="operationLogs" component={TMSDashboard.Log} />
            </Route>
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
              <Route path="carrier">
                <IndexRoute component={TMSResources.CarrierListContainer} />
              </Route>
              <Route path="vehicle">
                <IndexRoute component={TMSResources.VehicleListContainer} />
                <Route path="add" component={TMSResources.VehicleFormContainer} />
                <Route path="edit/:car_id" component={TMSResources.VehicleFormContainer} />
              </Route>
              <Route path="driver">
                <IndexRoute component={TMSResources.DriverListContainer} />
                <Route path="add" component={TMSResources.DriverFormContainer} />
                <Route path="edit/:driver_id" component={TMSResources.DriverFormContainer} />
              </Route>
              <Route path="node">
                <IndexRoute component={TMSResources.NodeListContainer} />
                <Route path="add" component={TMSResources.NodeFormContainer} />
                <Route path="edit/:node_id" component={TMSResources.NodeFormContainer} />
              </Route>
            </Route>
            <Route path="tariff">
              <IndexRoute component={TMSTariff.List} />
              <Route path="new" component={TMSTariff.CreateNew} />
              <Route path="edit/:uid" component={TMSTariff.Edit} />
            </Route>
            <Route path="billing">
              <IndexRedirect to="/transport/billing/receivable" />
              <Route path="receivable">
                <IndexRoute component={TMSBilling.ReceivableList} />
                <Route path="create" component={TMSBilling.CreateReceivableBilling} />
              </Route>
              <Route path="payable">
                <IndexRoute component={TMSBilling.PayableList} />
                <Route path="create" component={TMSBilling.CreatePayableBilling} />
              </Route>
              <Route path="checkBilling/:billingId" component={TMSBilling.CheckBilling} />
              <Route path="fee" component={TMSBilling.FeeList} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.clearance.id} component={Clearance}>
            <Route path="import">
              <IndexRoute component={ImportDelegation.List} />
              <Route path="create" component={ImportDelegation.Create} />
              <Route path="edit/:delgNo" component={ImportDelegation.Edit} />
              <Route path="docs">
                <Route path="make/:billno" component={ImportDocs.Make} />
                <Route path="view/:billno" component={ImportDocs.View} />
              </Route>
            </Route>
            <Route path="export">
              <IndexRoute component={ExportDelegation.List} />
              <Route path="create" component={ExportDelegation.Create} />
              <Route path="edit/:delgNo" component={ExportDelegation.Edit} />
              <Route path="docs">
                <Route path="make/:billno" component={ExportDocs.Make} />
                <Route path="view/:billno" component={ExportDocs.View} />
              </Route>
            </Route>
            <Route path="expense">
            </Route>
            <Route path="quote">
              <IndexRoute component={CMSQuote.List} />
              <Route path="create" component={CMSQuote.Create} />
              <Route path="edit/:quoteno" component={CMSQuote.Edit} />
            </Route>
            <Route path="relation">
              <IndexRoute component={CMSRelation.Manage} />
              <Route path="create" component={CMSRelation.Create} />
              <Route path="edit/:id" component={CMSRelation.Edit} />
            </Route>
            <Route path="settings">
              <IndexRoute component={CMSSettings.List} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.scv.id} component={SCV}>
            <IndexRedirect to="/scv/dashboard" />
            <Route path="dashboard" component={SCVDashboard.Index} />
            <Route path="orders" component={SCVOrders.List} />
            <Route path="inbound" component={SCVInbound.List} />
            <Route path="outbound" component={SCVOutbound.List} />
            <Route path="payments">
              <Route path="tax" component={SCVPaymentsTax.List} />
              <Route path="billing" component={SCVPaymentsBilling.List} />
            </Route>
            <Route path="analytics">
              <Route path="kpi" component={SCVAnalyticsKpi.List} />
              <Route path="cost" component={SCVAnalyticsCost.List} />
            </Route>
            <Route path="settings" component={SCVSettings.List} />
          </Route>
          <Route path={DEFAULT_MODULES.customer.id} component={CRM}>
            <IndexRedirect to="/customer/dashboard" />
            <Route path="dashboard" component={CRMDashboard.Index} />
            <Route path="orders" component={CRMOrders.List} />
          </Route>
        </Route>
      </Route>
    </Route>
  );
};
