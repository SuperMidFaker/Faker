import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import Root from './root';
import * as Home from './home';
import SSO from './sso/pack-sso';
import Login from './sso/login';
import Forgot from './sso/forgot';
import PackMessage from './message/pack-message';
import MessageList from './message/messageList';
import PackAccount from './account/pack-account';
import MyProfile from './account/profile';
import Password from './account/password';
import Corp from './corp/pack-corp';
import * as CorpOverview from './corp/overview';
import CorpInfo from './corp/info';
import * as Organization from './corp/organization';
import * as Personnel from './corp/personnel';
import * as Cooperation from './corp/cooperation';
import * as Role from './corp/role';
import Module from './module';
import TMS from './transport/module-transport';
import * as TMSDashboard from './transport/dashboard';
import * as TMSAcceptance from './transport/acceptance';
import * as TMSDispatch from './transport/dispatch';
import * as TMSTracking from './transport/tracking';
import * as TMSResources from './transport/resources';
import * as TMSBilling from './transport/billing';
import * as TMSTariff from './transport/tariff';
import * as PublicTMS from './pub/tracking';
import * as Template from './pub/template';
import CMS from './cms/module-clearance';
import * as CMSDashboard from './cms/dashboard';
import * as CMSImportDelegation from './cms/import/delegation';
import * as CMSImportManifest from './cms/import/manifest';
import * as CMSImportCustoms from './cms/import/customs';
import * as CMSImportCiq from './cms/import/ciq';
import * as CMSExportDelegation from './cms/export/delegation';
import * as CMSExportManifest from './cms/export/manifest';
import * as CMSExportCustoms from './cms/export/customs';
import * as CMSExportCiq from './cms/export/ciq';
import * as CMSRelation from './cms/relation';
import * as CMSQuote from './cms/quote';
import * as CMSExpense from './cms/expense';
import * as CMSSettings from './cms/settings';
import * as CMSBilling from './cms/billing';
import * as CMSResources from './cms/resources';
import * as CMSTradeItem from './cms/tradeitem';
import WCM from './wcm/module-wcm';
import * as WCMDashboard from './wcm/dashboard';
import * as WCMInbound from './wcm/inbound';
import * as WCMOutbound from './wcm/outbound';
import SCV from './scv/module-scv';
import * as SCVDashboard from './scv/dashboard';
import * as SCVOrders from './scv/orders';
import * as SCVInbound from './scv/inbound';
import * as SCVClearance from './scv/clearance';
import * as SCVInventory from './scv/inventory';
import * as SCVInventoryRecieving from './scv/inventory/recieving';
import * as SCVInventoryShipping from './scv/inventory/shipping';
import * as SCVInventoryProducts from './scv/inventory/products';
import * as SCVPaymentsTax from './scv/payments/tax';
import * as SCVPaymentsBilling from './scv/payments/billing';
import * as SCVAnalyticsKpi from './scv/analytics/kpi';
import * as SCVAnalyticsCost from './scv/analytics/cost';
import * as SCVSettings from './scv/settings';
import CRM from './crm/module-crm';
import * as CRMDashboard from './crm/dashboard';
import * as CRMOrders from './crm/orders';
import * as CRMCustomers from './crm/customers';
import * as CRMBilling from './crm/billing';
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
      <Route component={SSO}>
        <Route path="login" component={Login} />
        <Route path="forgot" component={Forgot} />
      </Route>
      <Route onEnter={requireAuth}>
        <IndexRoute component={Home.Main} />
        <Route path="notfound" component={Home.NotFound} />
        <Route path="my" component={PackAccount}>
          <Route path="profile" component={MyProfile} />
          <Route path="password" component={Password} />
        </Route>
        <Route path="message" component={PackMessage}>
          <Route path="list" component={MessageList} />
        </Route>
        <Route path="corp" component={Corp}>
          <IndexRedirect to="/corp/overview" />
          <Route path="overview" component={CorpOverview.Index} />
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
          <Route path={DEFAULT_MODULES.transport.id} component={TMS}>
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
            <Route path="billing">
              <IndexRedirect to="/transport/billing/receivable" />
              <Route path="receivable">
                <IndexRoute component={TMSBilling.ReceivableList} />
                <Route path="create" component={TMSBilling.CreateReceivableBilling} />
                <Route path="check/:billingId" component={TMSBilling.CheckReceivableBilling} />
                <Route path="edit/:billingId" component={TMSBilling.EditReceivableBilling} />
                <Route path="view/:billingId" component={TMSBilling.ViewReceivableBilling} />
              </Route>
              <Route path="payable">
                <IndexRoute component={TMSBilling.PayableList} />
                <Route path="create" component={TMSBilling.CreatePayableBilling} />
                <Route path="check/:billingId" component={TMSBilling.CheckPayableBilling} />
                <Route path="edit/:billingId" component={TMSBilling.EditPayableBilling} />
                <Route path="view/:billingId" component={TMSBilling.ViewPayableBilling} />
              </Route>
              <Route path="fee" component={TMSBilling.FeeList} />
              <Route path="tariff">
                <IndexRoute component={TMSTariff.List} />
                <Route path="new" component={TMSTariff.CreateNew} />
                <Route path="edit/:quoteNo/:version" component={TMSTariff.Edit} />
                <Route path="view/:quoteNo/:version" component={TMSTariff.View} />
              </Route>
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.clearance.id} component={CMS}>
            <Route path="dashboard" component={CMSDashboard.Index} />
            <Route path="import">
              <IndexRedirect to="/clearance/import/delegation" />
              <Route path="delegation" component={CMSImportDelegation.List} />
              <Route path="create" component={CMSImportDelegation.Create} />
              <Route path="edit/:delgNo" component={CMSImportDelegation.Edit} />
              <Route path="manifest">
                <Route path="make/:billno" component={CMSImportManifest.Make} />
                <Route path="view/:billno" component={CMSImportManifest.View} />
              </Route>
              <Route path="customs">
                <IndexRoute component={CMSImportCustoms.DeclList} />
                <Route path=":billseqno/:preEntrySeqNo" component={CMSImportCustoms.DeclView} />
              </Route>
              <Route path="ciq" component={CMSImportCiq.CiqList} />
            </Route>
            <Route path="export">
              <IndexRedirect to="/clearance/export/delegation" />
              <Route path="delegation" component={CMSExportDelegation.List} />
              <Route path="create" component={CMSExportDelegation.Create} />
              <Route path="edit/:delgNo" component={CMSExportDelegation.Edit} />
              <Route path="manifest">
                <Route path="make/:billno" component={CMSExportManifest.Make} />
                <Route path="view/:billno" component={CMSExportManifest.View} />
              </Route>
              <Route path="customs">
                <IndexRoute component={CMSExportCustoms.DeclList} />
                <Route path=":billseqno/:preEntrySeqNo" component={CMSExportCustoms.DeclView} />
              </Route>
              <Route path="ciq" component={CMSExportCiq.CiqList} />
            </Route>
            <Route path="billing">
              <IndexRedirect to="/clearance/billing/expense" />
              <Route path="expense" component={CMSExpense.List} />
              <Route path="receivable">
                <IndexRoute component={CMSBilling.ReceivableList} />
                <Route path="create" component={CMSBilling.CreateReceivableBilling} />
                <Route path="check/:billingId" component={CMSBilling.CheckReceivableBilling} />
                <Route path="view/:billingId" component={CMSBilling.ViewReceivableBilling} />
                <Route path="edit/:billingId" component={CMSBilling.EditReceivableBilling} />
              </Route>
              <Route path="payable">
                <IndexRoute component={CMSBilling.PayableList} />
                <Route path="create" component={CMSBilling.CreatePayableBilling} />
                <Route path="check/:billingId" component={CMSBilling.CheckPayableBilling} />
                <Route path="view/:billingId" component={CMSBilling.ViewPayableBilling} />
                <Route path="edit/:billingId" component={CMSBilling.EditPayableBilling} />
              </Route>
              <Route path="quote">
                <IndexRoute component={CMSQuote.List} />
                <Route path="edit/:quoteno/:version" component={CMSQuote.Edit} />
                <Route path="view/:quoteno/:version" component={CMSQuote.View} />
              </Route>
            </Route>
            <Route path="relation">
              <IndexRoute component={CMSRelation.Manage} />
              <Route path="create" component={CMSRelation.Create} />
              <Route path="edit/:id" component={CMSRelation.Edit} />
            </Route>
            <Route path="settings">
              <IndexRedirect to="/clearance/settings/quotetemplates" />
              <Route path="quotetemplates" component={CMSSettings.QuoteTemplates} />
            </Route>
            <Route path="resources">
              <Route path="broker">
                <IndexRoute component={CMSResources.BrokerContainer} />
              </Route>
              <Route path="tradeitem">
                <IndexRoute component={CMSTradeItem.List} />
              </Route>
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.scv.id} component={SCV}>
            <IndexRedirect to="/scv/dashboard" />
            <Route path="dashboard" component={SCVDashboard.Index} />
            <Route path="orders" component={SCVOrders.List} />
            <Route path="shipments">
              <Route path="inbound" component={SCVInbound.List} />
            </Route>
            <Route path="clearance" component={SCVClearance.List} />
            <Route path="inventory" >
              <Route path="stock" component={SCVInventory.List} />
              <Route path="recieving" component={SCVInventoryRecieving.List} />
              <Route path="shipping" component={SCVInventoryShipping.List} />
              <Route path="products" component={SCVInventoryProducts.List} />
            </Route>
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
          <Route path={DEFAULT_MODULES.wcm.id} component={WCM}>
            <IndexRedirect to="/wcm/dashboard" />
            <Route path="dashboard" component={WCMDashboard.Index} />
            <Route path="inbound" component={WCMInbound.List} />
            <Route path="outbound" component={WCMOutbound.List} />
          </Route>
          <Route path={DEFAULT_MODULES.customer.id} component={CRM}>
            <IndexRedirect to="/customer/orders" />
            <Route path="dashboard" component={CRMDashboard.Index} />
            <Route path="orders" >
              <IndexRoute component={CRMOrders.List} />
              <Route path="create" component={CRMOrders.Create} />
              <Route path="view" component={CRMOrders.View} />
              <Route path="edit" component={CRMOrders.Edit} />
            </Route>
            <Route path="customers" component={CRMCustomers.List} />
            <Route path="billing">
              <IndexRedirect to="/customer/billing/list" />
              <Route path="fees" component={CRMBilling.FeeList} />
              <Route path="list" component={CRMBilling.List} />
              <Route path="create" component={CRMBilling.Create} />
              <Route path="check/:billingId" component={CRMBilling.Check} />
              <Route path="edit/:billingId" component={CRMBilling.Edit} />
              <Route path="view/:billingId" component={CRMBilling.View} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*">
        <IndexRedirect to="/notfound" />
      </Route>
    </Route>
  );
};
