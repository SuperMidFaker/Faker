import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import warning from 'warning';
import { loadAccount } from 'common/reducers/account';
import { loadWhseContext } from 'common/reducers/cwmContext';
import { isLoaded } from 'client/common/redux-actions';
import { DEFAULT_MODULES } from 'common/constants/module';
import Root from './root';
import * as Home from './home';
import SSO from './sso/pack-sso';
import Login from './sso/login';
import Forgot from './sso/forgot';
import PackAccount from './account/packAccount';
import MyProfile from './account/profile';
import Password from './account/password';
import PackCorp from './corp/packCorp';
import * as Corp from './corp';
import * as CorpMembers from './corp/members';
import * as CorpRole from './corp/role';
import * as CorpLogs from './corp/logs';
import PackCollabHub from './hub/packCollabHub';
import * as Collab from './hub/collab';
import * as HubDev from './hub/dev';
import * as HubAdapter from './hub/adapter';
import * as HubIntegration from './hub/integration';
import * as HubArCTM from './hub/integration/arctm';
import * as HubQuickPass from './hub/integration/quickpass';
import * as HubEasipassEDI from './hub/integration/easipass';
import * as HubSingleWindow from './hub/integration/singlewindow';
import * as HubSHFTZ from './hub/integration/shftz';
import * as HubSFExpress from './hub/integration/sfexpress';
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
import * as CMSClients from './cms/delegation/clients';
import * as CMSCusDecl from './cms/customs';
import * as CMSCiqDecl from './cms/ciq';
import * as CMSImportManifest from './cms/import/manifest';
import * as CMSExportManifest from './cms/export/manifest';
import * as CMSBilling from './cms/billing';
import * as CMSQuote from './cms/billing/quote';
import * as CMSSettings from './cms/settings';
import * as CMSBrokers from './cms/settings/brokers';
import * as CMSTradeItemHSCode from './cms/tradeitem/hscode';
import * as CMSTradeItemRepo from './cms/tradeitem/repo';
import * as CMSTradeItemRepoItem from './cms/tradeitem/repo/item';
import * as CMSTradeItemTask from './cms/tradeitem/task';
import * as CMSTradeItemWorkspace from './cms/tradeitem/workspace';
import * as CMSManual from './cms/manual';
import * as CMSPermit from './cms/permit';
import * as CMSAnalytics from './cms/analytics';
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
import CWMSupSHFTZ from './cwm/supervision/shftz';
import * as CWMSupSHFTZEntry from './cwm/supervision/shftz/entry';
import * as CWMSupSHFTZTransferIn from './cwm/supervision/shftz/transfer/in';
import * as CWMSupSHFTZTransferOut from './cwm/supervision/shftz/transfer/out';
import * as CWMSupSHFTZTransferSelf from './cwm/supervision/shftz/transfer/self';
import * as CWMSupSHFTZRelNormal from './cwm/supervision/shftz/release/normal';
import * as CWMSupSHFTZRelPortion from './cwm/supervision/shftz/release/portion';
import * as CWMSupSHFTZNormalDecl from './cwm/supervision/shftz/decl/normal';
import * as CWMSupSHFTZBatchDecl from './cwm/supervision/shftz/decl/batch';
import * as CWMSupSHFTZStock from './cwm/supervision/shftz/stock';
import * as CWMSupSHFTZNonBondedStock from './cwm/supervision/shftz/stock/nonbonded';
import * as CWMSupSHFTZCargo from './cwm/supervision/shftz/cargo';
import SCOF from './scof/module-scof';
import * as SCOFDashboard from './scof/dashboard';
import * as SCOFOrders from './scof/orders';
import * as SCOFInvoices from './scof/invoices';
import * as SCOFTracking from './scof/tracking';
import * as SCOFCustomers from './scof/customers';
import * as SCOFVendors from './scof/vendors';
import * as SCOFFlow from './scof/flow';
import * as SCOFSettings from './scof/settings';
import BSS from './bss/module-bss';
import * as BSSDashboard from './bss/dashboard';
import * as BSSAudit from './bss/audit';
import * as BSSBill from './bss/bill';
import * as BSSSettings from './bss/settings';

export default(store) => {
  const requireAuth = (nextState, replace, cb) => {
    function checkAuth() {
      // const query = nextState.location.query;
      const currState = store.getState();
      const accountSubdomain = currState.account.subdomain;
      const { auth: { isAuthed }, corpDomain: { subdomain } } = currState;
      if (!isAuthed || (accountSubdomain && !__DEV__ && accountSubdomain !== subdomain)) {
        warning(
          !(accountSubdomain && accountSubdomain !== subdomain),
          'subdomain is not equal to account subdomain, maybe there are tenants with same unique code'
        );
        const query = { next: nextState.location.pathname };
        replace({ pathname: '/login', query });
      }
      cb();
    }
    if (!isLoaded(store.getState(), 'account')) {
      store.dispatch(loadAccount()).then(checkAuth);
    } else {
      checkAuth();
    }
  };
  const ensureCwmContext = (nextState, replace, cb) => {
    const storeState = store.getState();
    if (!storeState.cwmContext.loaded) {
      store.dispatch(loadWhseContext()).then(() => cb());
    } else {
      cb();
    }
  };
  // IndexRedirect passed nginx will readd subdomain
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
        <Route path="hub" component={PackCollabHub}>
          <IndexRedirect to="/hub/integration/apps" />
          <Route path="dev">
            <IndexRoute component={HubDev.List} />
            <Route path=":appId" component={HubDev.Config} />
          </Route>
          <Route path="adapter" component={HubAdapter.List} />
          <Route path="integration">
            <Route path="apps" component={HubIntegration.AppStore} />
            <Route path="installed" component={HubIntegration.InstalledList} />
            <Route path="arctm">
              <Route path="config/:uuid" component={HubArCTM.Config} />
            </Route>
            <Route path="quickpass">
              <Route path="config/:uuid" component={HubQuickPass.Config} />
            </Route>
            <Route path="easipass">
              <Route path="config/:uuid" component={HubEasipassEDI.Config} />
            </Route>
            <Route path="singlewindow">
              <Route path="config/:uuid" component={HubSingleWindow.Config} />
            </Route>
            <Route path="shftz">
              <Route path="config/:uuid" component={HubSHFTZ.Config} />
            </Route>
            <Route path="sfexpress">
              <Route path="config/:uuid" component={HubSFExpress.Config} />
            </Route>
          </Route>
          <Route path="collab">
            <Route path="invitation" component={Collab.Invitation} />
            <Route path="template" component={Collab.Template} />
          </Route>
        </Route>
        <Route path="corp" component={PackCorp}>
          <IndexRedirect to="/corp/info" />
          <Route path="info" component={Corp.Info} />
          <Route path="members">
            <IndexRoute component={CorpMembers.List} />
            <Route path="new" component={CorpMembers.Edit} />
            <Route path="edit/:id" component={CorpMembers.Edit} />
          </Route>
          <Route path="role">
            <IndexRoute component={CorpRole.List} />
            <Route path="new" component={CorpRole.Create} />
            <Route path="edit/:id" component={CorpRole.Edit} />
          </Route>
          <Route path="logs" component={CorpLogs.List} />
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
              <Route path="clients">
                <IndexRoute component={CMSClients.List} />
                <Route path="templates/invoice/:id" component={CMSClients.InvoiceTemplate} />
                <Route path="templates/contract/:id" component={CMSClients.ContractTemplate} />
                <Route path="templates/packinglist/:id" component={CMSClients.PackingListTemplate} />
              </Route>
              <Route path="edit/:delgNo" component={CMSDelegation.Detail} />
            </Route>
            <Route path="cusdecl">
              <IndexRoute component={CMSCusDecl.List} />
              <Route path=":ietype/:billseqno/:preEntrySeqNo" component={CMSCusDecl.Edit} />
            </Route>
            <Route path="ciqdecl">
              <IndexRoute component={CMSCiqDecl.List} />
              <Route path=":ioType/:declNo" component={CMSCiqDecl.Edit} />
            </Route>
            <Route path="import">
              <IndexRedirect to="/clearance/import/manifest" />
              <Route path="manifest">
                <Route path=":billno" component={CMSImportManifest.Make} />
                <Route path="view/:billno" component={CMSImportManifest.View} />
                <Route path="rules/edit/:id" component={CMSImportManifest.RuleEdit} />
                <Route path="rules/view/:id" component={CMSImportManifest.RuleView} />
              </Route>
            </Route>
            <Route path="export">
              <IndexRedirect to="/clearance/export/manifest" />
              <Route path="manifest">
                <Route path=":billno" component={CMSExportManifest.Make} />
                <Route path="view/:billno" component={CMSExportManifest.View} />
                <Route path="rules/edit/:id" component={CMSExportManifest.RuleEdit} />
                <Route path="rules/view/:id" component={CMSExportManifest.RuleView} />
              </Route>
            </Route>
            <Route path="manual">
              <IndexRoute component={CMSManual.List} />
              <Route path=":id" component={CMSManual.Detail} />
            </Route>
            <Route path="permit">
              <IndexRoute component={CMSPermit.List} />
              <Route path="add" component={CMSPermit.Add} />
              <Route path=":id" component={CMSPermit.Detail} />
            </Route>
            <Route path="billing">
              <Route path="receivable">
                <IndexRoute component={CMSBilling.ReceivableList} />
              </Route>
              <Route path="payable">
                <IndexRoute component={CMSBilling.PayableList} />
              </Route>
              <Route path="expense/:delgNo/fees" component={CMSBilling.Expense} />
              <Route path="quote">
                <IndexRoute component={CMSQuote.List} />
                <Route path=":quoteNo" component={CMSQuote.Edit} />
              </Route>
            </Route>
            <Route path="analytics">
              <IndexRoute component={CMSAnalytics.List} />
              <Route path="report/:id" component={CMSAnalytics.Report} />
            </Route>
            <Route path="settings">
              <IndexRedirect to="/clearance/settings/preferences" />
              <Route path="preferences" component={CMSSettings.Preferences} />
              <Route path="brokers" component={CMSBrokers.List} />
            </Route>
            <Route path="tradeitem">
              <IndexRedirect to="/clearance/tradeitem/repo" />
              <Route path="repo">
                <IndexRoute component={CMSTradeItemRepo.List} />
                <Route path=":repoId">
                  <IndexRoute component={CMSTradeItemRepo.Content} />
                  <Route path="item">
                    <Route path="add" component={CMSTradeItemRepoItem.Add} />
                    <Route path="edit/:id" component={CMSTradeItemRepoItem.Edit} />
                    <Route path="fork/:id" component={CMSTradeItemRepoItem.Fork} />
                  </Route>
                </Route>
              </Route>
              <Route path="task">
                <IndexRoute component={CMSTradeItemTask.List} />
                <Route path=":id" component={CMSTradeItemTask.Detail} />
              </Route>
              <Route path="workspace">
                <Route path="emerges" component={CMSTradeItemWorkspace.Emerge} />
                <Route path="conflicts" component={CMSTradeItemWorkspace.Conflict} />
                <Route path="invalids" component={CMSTradeItemWorkspace.Invalid} />
                <Route path="pendings" component={CMSTradeItemWorkspace.Pending} />
                <Route path="item/:id" component={CMSTradeItemWorkspace.ItemPage} />
              </Route>
              <Route path="hscode">
                <IndexRoute component={CMSTradeItemHSCode.List} />
                <Route path="special" component={CMSTradeItemHSCode.Special} />
                <Route path="changes" component={CMSTradeItemHSCode.Changes} />
              </Route>
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
              <Route path="shftz" component={CWMSupSHFTZ}>
                <IndexRedirect to="/cwm/supervision/shftz/entry" />
                <Route path="entry" >
                  <IndexRoute component={CWMSupSHFTZEntry.List} />
                  <Route path=":preEntrySeqNo" component={CWMSupSHFTZEntry.Detail} />
                </Route>
                <Route path="transfer/in" >
                  <IndexRoute component={CWMSupSHFTZTransferIn.List} />
                  <Route path=":preFtzEntNo" component={CWMSupSHFTZTransferIn.Detail} />
                </Route>
                <Route path="transfer/self" >
                  <IndexRoute component={CWMSupSHFTZTransferSelf.List} />
                  <Route path=":asnNo" component={CWMSupSHFTZTransferSelf.Detail} />
                </Route>
                <Route path="release/normal" >
                  <IndexRoute component={CWMSupSHFTZRelNormal.List} />
                  <Route path=":soNo" component={CWMSupSHFTZRelNormal.Detail} />
                </Route>
                <Route path="release/portion" >
                  <IndexRoute component={CWMSupSHFTZRelPortion.List} />
                  <Route path=":soNo" component={CWMSupSHFTZRelPortion.Detail} />
                </Route>
                <Route path="transfer/out" >
                  <IndexRoute component={CWMSupSHFTZTransferOut.List} />
                  <Route path=":soNo" component={CWMSupSHFTZTransferOut.Detail} />
                </Route>
                <Route path="decl/normal" >
                  <IndexRoute component={CWMSupSHFTZNormalDecl.List} />
                  <Route path=":clearanceNo" component={CWMSupSHFTZNormalDecl.Detail} />
                </Route>
                <Route path="decl/batch" >
                  <IndexRoute component={CWMSupSHFTZBatchDecl.List} />
                  <Route path=":batchNo" component={CWMSupSHFTZBatchDecl.Detail} />
                </Route>
                <Route path="stock" >
                  <IndexRoute component={CWMSupSHFTZStock.List} />
                  <Route path="task/:taskId" component={CWMSupSHFTZStock.Task} />
                  <Route path="matchtask/:taskId" component={CWMSupSHFTZStock.MatchTask} />
                  <Route path="nonbonded" component={CWMSupSHFTZNonBondedStock.List} />
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
              <Route path="templates" component={CWMSettings.Templates} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.scof.id} component={SCOF}>
            <IndexRedirect to="/scof/dashboard" />
            <Route path="dashboard" component={SCOFDashboard.Index} />
            <Route path="orders" >
              <IndexRoute component={SCOFOrders.List} />
              <Route path="create" component={SCOFOrders.Create} />
              <Route path="edit/:orderNo" component={SCOFOrders.Edit} />
            </Route>
            <Route path="invoices">
              <IndexRoute component={SCOFInvoices.List} />
              <Route path="create" component={SCOFInvoices.Create} />
              <Route path="edit/:invoiceNo" component={SCOFInvoices.Edit} />
            </Route>
            <Route path="tracking">
              <Route path="customize">
                <IndexRoute component={SCOFTracking.Customize} />
              </Route>
              <Route path=":trackingId" component={SCOFTracking.Instance} />
            </Route>
            <Route path="customers" component={SCOFCustomers.List} />
            <Route path="vendors" component={SCOFVendors.List} />
            <Route path="flow" component={SCOFFlow.List} />
            <Route path="settings">
              <IndexRedirect to="/scof/settings/orderparams" />
              <Route path="orderparams" component={SCOFSettings.OrderParams} />
            </Route>
          </Route>
          <Route path={DEFAULT_MODULES.bss.id} component={BSS}>
            <IndexRedirect to="/bss/dashboard" />
            <Route path="dashboard" component={BSSDashboard.Index} />
            <Route path="audit">
              <IndexRoute component={BSSAudit.List} />
              <Route path=":orderRelNo" component={BSSAudit.Detail} />
            </Route>
            <Route path="bill">
              <IndexRoute component={BSSBill.List} />
              <Route path="reconcile/:billNo" component={BSSBill.Reconcile} />
              <Route path="templates" component={BSSBill.Templates} />
              <Route path="template/:templateId/fees" component={BSSBill.TemplateFees} />
              <Route path=":billNo" component={BSSBill.Detail} />
            </Route>
            <Route path="settings">
              <IndexRedirect to="/bss/settings/preferences" />
              <Route path="preferences" component={BSSSettings.Preferences} />
              <Route path="fees" component={BSSSettings.Fees} />
              <Route path="exchangerates" component={BSSSettings.ExchangeRates} />
              <Route path="taxrates" component={BSSSettings.TaxRates} />
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
