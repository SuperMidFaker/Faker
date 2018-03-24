import { combineReducers } from 'redux';
import activities from './activities';
import preference from './preference';
import common from './common';
import auth from './auth';
import account from './account';
import notification from './notification';
import chinaRegions from './chinaRegions';
import navbar from './navbar';
import corpDomain from './corp-domain';
import corps from './corps';
import personnel from './personnel';
import partner from './partner';
import role from './role';
import invitation from './invitation';
import operationLog from './operationLog';
import bssAudit from './bssAudit';
import bssFeeSettings from './bssFeeSettings';
import bssExRateSettings from './bssExRateSettings';
import bssBillTemplate from './bssBillTemplate';
import bssBill from './bssBill';
import bssStatement from './bssStatement';
import cmsDashboard from './cmsDashboard';
import cmsDelegation from './cmsDelegation';
import cmsDelegationDock from './cmsDelegationDock';
import cmsCustomsDeclare from './cmsCustomsDeclare';
import cmsCiqDeclare from './cmsCiqDeclare';
import cmsPermit from './cmsPermit';
import cmsManifest from './cmsManifest';
import cmsManifestImport from './cmsManifestImport';
import cmsInvoice from './cmsInvoice';
import cmsQuote from './cmsQuote';
import cmsResources from './cmsResources';
import cmsBrokers from './cmsBrokers';
import cmsTradeManual from './cmsTradeManual';
import cmsAnalytics from './cmsAnalytics';
import cmsPreferences from './cmsPreferences';
import cmsExpense from './cmsExpense';
import cmsTradeitem from './cmsTradeitem';
import cmsHsCode from './cmsHsCode';
import cmsParams from './cmsParams';
import sofCustomers from './sofCustomers';
import sofOrders from './sofOrders';
import crmBilling from './crmBilling';
import cwmReceive from './cwmReceive';
import cwmOutbound from './cwmOutbound';
import cwmInventoryStock from './cwmInventoryStock';
import cwmMovement from './cwmMovement';
import cwmWarehouse from './cwmWarehouse';
import cwmWhseLocation from './cwmWhseLocation';
import cwmShFtz from './cwmShFtz';
import cwmShFtzDecl from './cwmShFtzDecl';
import cwmShippingOrder from './cwmShippingOrder';
import cwmDashboard from './cwmDashboard';
import cwmContext from './cwmContext';
import cwmTransaction from './cwmTransaction';
import cwmTransition from './cwmTransition';
import cwmSku from './cwmSku';
import hubDataAdapter from './hubDataAdapter';
import hubDevApp from './hubDevApp';
import hubIntegration from './hubIntegration';
import scofFlow from './scofFlow';
import sofOrderPref from './sofOrderPref';
import sofVendors from './sofVendors';
import sofTracking from './sofTracking';
import transportAcceptance from './transport-acceptance';
import trackingLandStatus from './trackingLandStatus';
import trackingLandPod from './trackingLandPod';
import trackingLandException from './trackingLandException';
import shipment from './shipment';
import transportDispatch from './transportDispatch';
import transportResources from './transportResources';
import transportSettings from './transportSettings';
import transportTariff from './transportTariff';
import transportBilling from './transportBilling';
import transportKpi from './transportKpi';
import template from './template';
import sofDashboard from './sofDashboard';
import sofInvoice from './sofInvoice';
import uploadRecords from './uploadRecords';

export default combineReducers({
  activities,
  preference,
  common,
  auth,
  account,
  notification,
  chinaRegions,
  navbar,
  corpDomain,
  corps,
  personnel,
  partner,
  role,
  invitation,
  operationLog,
  hubIntegration,
  shipment,
  transportAcceptance,
  trackingLandStatus,
  trackingLandPod,
  trackingLandException,
  transportDispatch,
  transportResources,
  transportSettings,
  transportTariff,
  transportBilling,
  transportKpi,
  bssAudit,
  bssFeeSettings,
  bssExRateSettings,
  bssBill,
  bssBillTemplate,
  bssStatement,
  cmsDashboard,
  cmsDelegation,
  cmsDelegationDock,
  cmsCustomsDeclare,
  cmsManifest,
  cmsManifestImport,
  cmsInvoice,
  cmsQuote,
  cmsResources,
  cmsPreferences,
  cmsExpense,
  cmsTradeitem,
  cmsHsCode,
  cmsBrokers,
  cmsTradeManual,
  cmsAnalytics,
  cmsParams,
  scofFlow,
  sofOrderPref,
  sofVendors,
  sofTracking,
  sofCustomers,
  sofOrders,
  crmBilling,
  cwmReceive,
  cwmOutbound,
  cwmWarehouse,
  cwmWhseLocation,
  cwmContext,
  cwmTransaction,
  cwmSku,
  cwmShFtz,
  cwmShFtzDecl,
  cwmShippingOrder,
  cwmDashboard,
  cwmInventoryStock,
  cwmTransition,
  cwmMovement,
  hubDataAdapter,
  cmsCiqDeclare,
  cmsPermit,
  hubDevApp,
  template,
  sofDashboard,
  sofInvoice,
  uploadRecords,
});
