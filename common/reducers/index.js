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
import openIntegration from './openIntegration';
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
import cmsDashboard from './cmsDashboard';
import cmsDelegation from './cmsDelegation';
import cmsDelgInfoHub from './cmsDelgInfoHub';
import cmsDeclare from './cmsDeclare';
import cmsManifest from './cmsManifest';
import cmsManifestImport from './cmsManifestImport';
import cmsInvoice from './cmsInvoice';
import cmsQuote from './cmsQuote';
import cmsResources from './cmsResources';
import cmsBrokers from './cmsBrokers';
import cmsTradeManual from './cmsTradeManual';
import cmsPreferences from './cmsPreferences';
import scofFlow from './scofFlow';
import sofVendors from './sofVendors';
import scvInboundShipments from './scvInboundShipments';
import scvOutboundShipments from './scvOutboundShipments';
import scvInventoryStock from './scvInventoryStock';
import scvInventoryTransaction from './scvInventoryTransaction';
import scvWarehouse from './scvWarehouse';
import scvTracking from './scvTracking';
import scvClassification from './scvClassification';
import scvClearance from './scvClearance';
import cmsExpense from './cmsExpense';
import cmsBilling from './cmsBilling';
import cmsTradeitem from './cmsTradeitem';
import cmsHsCode from './cmsHsCode';
import crmCustomers from './crmCustomers';
import crmOrders from './crmOrders';
import crmBilling from './crmBilling';
import cwmReceive from './cwmReceive';
import cwmOutbound from './cwmOutbound';
import cwmInventoryStock from './cwmInventoryStock';
import cwmMovement from './cwmMovement';
import cwmWarehouse from './cwmWarehouse';
import cwmWhseLocation from './cwmWhseLocation';
import cwmShFtz from './cwmShFtz';
import cwmShippingOrder from './cwmShippingOrder';
import cwmDashboard from './cwmDashboard';
import cwmContext from './cwmContext';
import cwmTransaction from './cwmTransaction';
import cwmTransition from './cwmTransition';
import cwmSku from './cwmSku';
import saasLineFileAdaptor from './saasLineFileAdaptor';
import cmsCiqDeclare from './cmsCiqDeclare';

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
  openIntegration,
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
  cmsDashboard,
  cmsDelegation,
  cmsDelgInfoHub,
  cmsDeclare,
  cmsManifest,
  cmsManifestImport,
  cmsInvoice,
  cmsQuote,
  cmsResources,
  cmsPreferences,
  cmsExpense,
  cmsBilling,
  cmsTradeitem,
  cmsHsCode,
  cmsBrokers,
  cmsTradeManual,
  scofFlow,
  sofVendors,
  scvInboundShipments,
  scvOutboundShipments,
  scvInventoryStock,
  scvInventoryTransaction,
  scvWarehouse,
  scvTracking,
  scvClassification,
  scvClearance,
  crmCustomers,
  crmOrders,
  crmBilling,
  cwmReceive,
  cwmOutbound,
  cwmWarehouse,
  cwmWhseLocation,
  cwmContext,
  cwmTransaction,
  cwmSku,
  cwmShFtz,
  cwmShippingOrder,
  cwmDashboard,
  cwmInventoryStock,
  cwmTransition,
  cwmMovement,
  saasLineFileAdaptor,
  cmsCiqDeclare,
});
