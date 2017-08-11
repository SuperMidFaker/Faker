import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import warning from 'warning';
import Root from './root';
import * as Home from './home';
import SSO from './sso/pack-sso';
import Login from './sso/login';
import Forgot from './sso/forgot';
import PackAccount from './account/pack-account';
import MyProfile from './account/profile';
import Password from './account/password';
import Corp from './corp/pack-corp';
import * as CorpOverview from './corp/overview';
import CorpInfo from './corp/info';
import * as Organization from './corp/organization';
import * as CorpMembers from './corp/members';
import * as Role from './corp/role';
import PackDataHub from './hub/packDataHub';
import * as Collab from './hub/collab';
import * as OpenAPI from './hub/api';
import * as OpenIntegration from './hub/integration';
import * as IntegraionArCTM from './hub/integration/arctm';
import * as IntegraionEasipassEDI from './hub/integration/easipass';
import * as IntegraionSHFTZ from './hub/integration/shftz';
import Module from './module';
import TMS from './transport/module-transport';
import * as TMSDashboard from './transport/dashboard';
import * as TMSAcceptance from './transport/acceptance';
import * as TMSDispatch from './transport/dispatch';
import * as TMSTracking from './transport/tracking';
import * as TMSResources from './transport/resources';
import * as TMSSettings from './transport/settings';
import * as TMSBilling from './transport/billing';
import * as TMSAnalytics from './transport/analytics';
import * as TMSTariff from './transport/tariff';
import PackPub from './pub/packPub';
import * as PublicTMS from './pub/tracking';
import * as Template from './pub/template';
import CMS from './cms/module-clearance';
import * as CMSDashboard from './cms/dashboard';
import * as CMSDelegation from './cms/delegation';
import * as CMSCustomsDecl from './cms/customs';
import * as CMSCiqDecl from './cms/ciq';
import * as CMSImportManifest from './cms/import/manifest';
import * as CMSImportCustoms from './cms/import/customs';
import * as CMSImportCiq from './cms/import/ciq';
import * as CMSExportManifest from './cms/export/manifest';
import * as CMSExportCustoms from './cms/export/customs';
import * as CMSExportCiq from './cms/export/ciq';
import * as CMSQuote from './cms/quote';
import * as CMSExpense from './cms/expense';
import * as CMSBilling from './cms/billing';
import * as CMSSettings from './cms/settings';
import * as CMSBrokers from './cms/settings/brokers';
import * as CMSTradeItem from './cms/classification/tradeitem';
import * as CMSClassificationHsCode from './cms/classification/hscode';
import * as CMSClassificationSpecial from './cms/classification/special';
import CWM from './cwm/module-cwm';
import * as CWMDashboard from './cwm/dashboard';
import * as CWMReceivingASN from './cwm/receiving/asn';
import * as CWMReceivingInbound from './cwm/receiving/inbound';
import * as CWMShippingOrder from './cwm/shipping/order';
import * as CWMShippingWave from './cwm/shipping/wave';
import * as CWMShippingOutbound from './cwm/shipping/outbound';
import * as CWMStockInventory from './cwm/stock/inventory';
import * as CWMStockTransactions from './cwm/stock/transactions';
import * as CWMStockTransition from './cwm/stock/transition';
import * as CWMStockMovement from './cwm/stock/movement';
import * as CWMProductsSku from './cwm/products/sku';
import * as CWMSettings from './cwm/settings';
import * as CWMSupSHFTZEntry from './cwm/supervision/shftz/entry';
import * as CWMSupSHFTZRelease from './cwm/supervision/shftz/release';
import * as CWMSupSHFTZClearance from './cwm/supervision/shftz/clearance';
import * as CWMSupSHFTZBatch from './cwm/supervision/shftz/batch';
import * as CWMSupSHFTZCargo from './cwm/supervision/shftz/cargo';
import SCV from './scv/module-scv';
import * as SCVDashboard from './scv/dashboard';
import * as SCVOrders from './scv/orders';
import * as SCVTracking from './scv/tracking';
import * as SCVInboundShipments from './scv/shipments/inbound';
import * as SCVCustomsDecl from './scv/clearance/customsdecl';
import * as SCVDeclManifest from './scv/clearance/manifest';
import * as SCVInventoryStock from './scv/inventory/stock';
import * as SCVInventoryTransaction from './scv/inventory/transaction';
import * as SCVReceivingNotice from './scv/inventory/receiving';
import * as SCVShippingOrder from './scv/inventory/shipping';
import * as SCVInventorySku from './scv/inventory/sku';
import * as SCVClassification from './scv/compliance/classification';
import * as SCVPaymentsTax from './scv/payments/tax';
import * as SCVPaymentsBilling from './scv/payments/billing';
import * as SCVAnalyticsKpi from './scv/analytics/kpi';
import * as SCVAnalyticsCost from './scv/analytics/cost';
import * as SCVResource from './scv/resources';
import * as SCVSettings from './scv/settings';
import SCOF from './scof/module-scof';
import * as SCOFDashboard from './scof/dashboard';
import * as SCOFOrders from './scof/orders';
import * as SCOFCustomers from './scof/customers';
import * as SCOFFlow from './scof/flow';
import * as SCOFBilling from './scof/billing';
import { loadAccount } from 'common/reducers/account';
import { loadWhseContext } from 'common/reducers/cwmContext';
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
        warning(!(subdomain !== null && query && query.subdomain && query.subdomain !== subdomain),
          'subdomain is not equal to account subdomain, maybe there are tenants with same unique code');
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
  const ensureCwmContext = (nextState, replace, cb) => {
    const storeState = store.getState();
    if (!storeState.cwmContext.loaded) {
      store.dispatch(loadWhseContext(storeState.account.tenantId)).then(() => cb());
    } else {
      cb();
    }
  };
  return (
    <Route path="/" component={Root}>
      <Route path="pub" component={PackPub}>
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
        <Route path="hub" component={PackDataHub}>
          <IndexRedirect to="/hub/integration/installed" />
          <Route path="api">
            <Route path="auth" component={OpenAPI.Auth} />
            <Route path="webhook" component={OpenAPI.Webhook} />
          </Route>
          <Route path="integration">
            <Route path="apps" component={OpenIntegration.AppsList} />
            <Route path="installed" component={OpenIntegration.InstalledList} />
            <Route path="arctm">
              <Route path="install" component={IntegraionArCTM.Install} />
              <Route path="config/:uuid" component={IntegraionArCTM.Config} />
            </Route>
            <Route path="easipass">
              <Route path="install" component={IntegraionEasipassEDI.Install} />
              <Route path="config/:uuid" component={IntegraionEasipassEDI.Config} />
            </Route>
            <Route path="shftz">
              <Route path="install" component={IntegraionSHFTZ.Install} />
              <Route path="config/:uuid" component={IntegraionSHFTZ.Config} />
            </Route>
          </Route>
          <Route path="collab">
            <Route path="partners" component={Collab.Partners} />
          </Route>
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
          <Route path="members">
            <IndexRoute component={CorpMembers.List} />
            <Route path="new" component={CorpMembers.Edit} />
            <Route path="edit/:id" component={CorpMembers.Edit} />
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
              <Route path="create" component={TMSAcceptance.CreateNew} />
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
              <IndexRedirect to="/transport/resources/carrier" />
              <Route path="carrier">
                <IndexRoute component={TMSResources.CarrierListContainer} />
              </Route>
              <Route path="vehicle" component={TMSResources.VehicleListContainer} />
              <Route path="driver" component={TMSResources.DriverListContainer} />
              <Route path="node">
                <IndexRoute component={TMSResources.NodeListContainer} />
                <Route path="edit/:node_id" component={TMSResources.NodeFormContainer} />
              </Route>
            </Route>
            <Route path="settings">
              <IndexRedirect to="/transport/settings/transportModes" />
              <Route path="transportModes" component={TMSSettings.TransportModes} />
              <Route path="paramVehicles" component={TMSSettings.ParamVehicles} />
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
            <Route path="analytics">
              <Route path="kpi" component={TMSAnalytics.Kpi} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.clearance.id} component={CMS}>
            <Route path="dashboard" component={CMSDashboard.Index} />
            <Route path="delegation">
              <IndexRoute component={CMSDelegation.List} />
              <Route path="create" component={CMSDelegation.Create} />
              <Route path=":delgNo" component={CMSDelegation.Detail} />
            </Route>
            <Route path="customs">
              <IndexRoute component={CMSCustomsDecl.List} />
            </Route>
            <Route path="ciq" component={CMSCiqDecl.List} />
            <Route path="import">
              <IndexRedirect to="/clearance/import/manifest" />
              <Route path="manifest">
                <IndexRoute component={CMSImportManifest.List} />
                <Route path=":billno" component={CMSImportManifest.Make} />
                <Route path="view/:billno" component={CMSImportManifest.View} />
                <Route path="rules/edit/:id" component={CMSImportManifest.RuleEdit} />
                <Route path="rules/view/:id" component={CMSImportManifest.RuleView} />
              </Route>
              <Route path="customs">
                <IndexRoute component={CMSImportCustoms.DeclList} />
                <Route path=":billseqno/:preEntrySeqNo" component={CMSImportCustoms.DeclView} />
              </Route>
              <Route path="ciq" component={CMSImportCiq.CiqList} />
            </Route>
            <Route path="export">
              <IndexRedirect to="/clearance/export/manifest" />
              <Route path="manifest">
                <IndexRoute component={CMSExportManifest.List} />
                <Route path=":billno" component={CMSExportManifest.Make} />
                <Route path="view/:billno" component={CMSExportManifest.View} />
                <Route path="rules/edit/:id" component={CMSExportManifest.RuleEdit} />
                <Route path="rules/view/:id" component={CMSExportManifest.RuleView} />
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
                <Route path="template" component={CMSQuote.Template} />
              </Route>
            </Route>
            <Route path="settings">
              <IndexRedirect to="/clearance/settings/resources" />
              <Route path="brokers" component={CMSBrokers.List} />
              <Route path="preferences" component={CMSSettings.Preferences} />
              <Route path="resources">
                <IndexRoute component={CMSSettings.Resources} />
                <Route path="templates/invoice/:id" component={CMSSettings.InvoiceTemplate} />
                <Route path="templates/contract/:id" component={CMSSettings.ContractTemplate} />
                <Route path="templates/packinglist/:id" component={CMSSettings.PackingListTemplate} />
              </Route>
            </Route>
            <Route path="classification">
              <Route path="tradeitem">
                <IndexRoute component={CMSTradeItem.List} />
                <Route path="create" component={CMSTradeItem.Create} />
                <Route path="edit/:id" component={CMSTradeItem.Edit} />
              </Route>
              <Route path="hscode" component={CMSClassificationHsCode.List} />
              <Route path="special" component={CMSClassificationSpecial.Categories} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.scv.id} component={SCV}>
            <IndexRedirect to="/scv/dashboard" />
            <Route path="dashboard" component={SCVDashboard.Index} />
            <Route path="orders" component={SCVOrders.List} />
            <Route path="tracking">
              <Route path="customize">
                <IndexRoute component={SCVTracking.Customize} />
              </Route>
              <Route path=":trackingId" component={SCVTracking.Instance} />
            </Route>
            <Route path="shipments">
              <Route path="inbound">
                <IndexRoute component={SCVInboundShipments.List} />
              </Route>
            </Route>
            <Route path="clearance">
              <Route path="manifest" component={SCVDeclManifest.List} />
              <Route path="decl" component={SCVCustomsDecl.List} />
            </Route>
            <Route path="inventory">
              <Route path="stock" component={SCVInventoryStock.List} />
              <Route path="transaction" component={SCVInventoryTransaction.List} />
              <Route path="receiving">
                <IndexRoute component={SCVReceivingNotice.List} />
                <Route path="create" component={SCVReceivingNotice.Create} />
              </Route>
              <Route path="shipping">
                <IndexRoute component={SCVShippingOrder.List} />
                <Route path="create" component={SCVShippingOrder.Create} />
              </Route>
              <Route path="sku">
                <IndexRoute component={SCVInventorySku.List} />
                <Route path="create" component={SCVInventorySku.Create} />
                <Route path=":sku" component={SCVInventorySku.Edit} />
              </Route>
            </Route>
            <Route path="payments">
              <Route path="tax" component={SCVPaymentsTax.List} />
              <Route path="billing" component={SCVPaymentsBilling.List} />
            </Route>
            <Route path="compliance">
              <Route path="classification">
                <IndexRoute component={SCVClassification.List} />
                <Route path="create" component={SCVClassification.Create} />
                <Route path="edit/:id" component={SCVClassification.Edit} />
                <Route path="master" component={SCVClassification.Master} />
                <Route path="slave" component={SCVClassification.Slave} />
              </Route>
            </Route>
            <Route path="analytics">
              <Route path="kpi" component={SCVAnalyticsKpi.List} />
              <Route path="cost" component={SCVAnalyticsCost.List} />
            </Route>
            <Route path="resources">
              <IndexRoute component={SCVResource.Warehouses} />
              <Route path="warehouse" component={SCVResource.Warehouses} />
              <Route path="serviceprovider" component={SCVResource.ServiceProviders} />
            </Route>
            <Route path="settings">
              <IndexRedirect to="/scv/settings/openapi" />
              <Route path="openapi" component={SCVSettings.OpenApi} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.cwm.id} component={CWM} onEnter={ensureCwmContext}>
            <IndexRedirect to="/cwm/dashboard" />
            <Route path="dashboard" component={CWMDashboard.Index} />
            <Route path="receiving">
              <Route path="asn">
                <IndexRoute component={CWMReceivingASN.List} />
                <Route path="create" component={CWMReceivingASN.Create} />
                <Route path=":asnNo" component={CWMReceivingASN.Detail} />
              </Route>
              <Route path="inbound">
                <IndexRoute component={CWMReceivingInbound.List} />
                <Route path=":inboundNo" component={CWMReceivingInbound.Detail} />
              </Route>
            </Route>
            <Route path="shipping">
              <Route path="order">
                <IndexRoute component={CWMShippingOrder.List} />
                <Route path="create" component={CWMShippingOrder.Create} />
                <Route path=":soNo" component={CWMShippingOrder.Detail} />
              </Route>
              <Route path="wave">
                <IndexRoute component={CWMShippingWave.List} />
                <Route path=":waveNo" component={CWMShippingWave.Detail} />
              </Route>
              <Route path="outbound">
                <IndexRoute component={CWMShippingOutbound.List} />
                <Route path=":outboundNo" component={CWMShippingOutbound.Detail} />
              </Route>
            </Route>
            <Route path="stock">
              <Route path="inventory" component={CWMStockInventory.List} />
              <Route path="transactions" component={CWMStockTransactions.List} />
              <Route path="transition" component={CWMStockTransition.List} />
              <Route path="movement">
                <IndexRoute component={CWMStockMovement.List} />
                <Route path=":movementNo" component={CWMStockMovement.Detail} />
              </Route>
            </Route>
            <Route path="supervision">
              <Route path="shftz">
                <IndexRedirect to="/cwm/supervision/shftz/entry" />
                <Route path="entry" >
                  <IndexRoute component={CWMSupSHFTZEntry.List} />
                  <Route path=":asnNo" component={CWMSupSHFTZEntry.Detail} />
                </Route>
                <Route path="release" >
                  <IndexRoute component={CWMSupSHFTZRelease.List} />
                  <Route path=":soNo" component={CWMSupSHFTZRelease.Detail} />
                </Route>
                <Route path="clearance" >
                  <IndexRoute component={CWMSupSHFTZClearance.List} />
                  <Route path=":clearanceNo" component={CWMSupSHFTZClearance.Detail} />
                </Route>
                <Route path="batch" >
                  <IndexRoute component={CWMSupSHFTZBatch.List} />
                  <Route path=":batchNo" component={CWMSupSHFTZBatch.Detail} />
                </Route>
                <Route path="cargo" >
                  <IndexRoute component={CWMSupSHFTZCargo.List} />
                </Route>
              </Route>
            </Route>
            <Route path="products">
              <Route path="sku">
                <IndexRoute component={CWMProductsSku.List} />
                <Route path="create" component={CWMProductsSku.Create} />
                <Route path="edit/:sku" component={CWMProductsSku.Edit} />
              </Route>
            </Route>
            <Route path="settings">
              <Route path="warehouse" component={CWMSettings.Warehouse} />
              <Route path="rules" component={CWMSettings.Rules} />
              <Route path="templates" component={CWMSettings.Templates} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.scof.id} component={SCOF}>
            <IndexRedirect to="/scof/orders" />
            <Route path="dashboard" component={SCOFDashboard.Index} />
            <Route path="orders" >
              <IndexRoute component={SCOFOrders.List} />
              <Route path="create" component={SCOFOrders.Create} />
              <Route path="view" component={SCOFOrders.View} />
              <Route path="edit" component={SCOFOrders.Edit} />
            </Route>
            <Route path="customers" component={SCOFCustomers.List} />
            <Route path="flow" component={SCOFFlow.ListPanel} />
            <Route path="billing">
              <IndexRedirect to="/scof/billing/list" />
              <Route path="fees" component={SCOFBilling.FeeList} />
              <Route path="list" component={SCOFBilling.List} />
              <Route path="create" component={SCOFBilling.Create} />
              <Route path="check/:billingId" component={SCOFBilling.Check} />
              <Route path="edit/:billingId" component={SCOFBilling.Edit} />
              <Route path="view/:billingId" component={SCOFBilling.View} />
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
