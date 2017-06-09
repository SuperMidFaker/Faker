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
import cmsDelegation from './cmsDelegation';
import cmsDelgInfoHub from './cmsDelgInfoHub';
import cmsDeclare from './cmsDeclare';
import cmsManifest from './cmsManifest';
import cmsInvoice from './cmsInvoice';
import cmsQuote from './cmsQuote';
import cmsResources from './cmsResources';
import scofFlow from './scofFlow';
import scvInboundShipments from './scvInboundShipments';
import scvOutboundShipments from './scvOutboundShipments';
import scvInventoryStock from './scvInventoryStock';
import scvInventoryTransaction from './scvInventoryTransaction';
import scvWarehouse from './scvWarehouse';
import scvTracking from './scvTracking';
import scvClassification from './scvClassification';
import scvClearance from './scvClearance';
import cwmContext from './cwmContext';
import cwmTransaction from './cwmTransaction';
import cwmSku from './cwmSku';
import cmsExpense from './cmsExpense';
import cmsBilling from './cmsBilling';
import cmsTradeitem from './cmsTradeitem';
import cmsHsCode from './cmsHsCode';
import crmCustomers from './crmCustomers';
import crmOrders from './crmOrders';
import crmBilling from './crmBilling';
import cwmReceive from './cwmReceive';
import cwmWarehouse from './cwmWarehouse';
import cwmShFtz from './cwmShFtz';

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
  cmsDelegation,
  cmsDelgInfoHub,
  cmsDeclare,
  cmsManifest,
  cmsInvoice,
  cmsQuote,
  cmsResources,
  scofFlow,
  scvInboundShipments,
  scvOutboundShipments,
  scvInventoryStock,
  scvInventoryTransaction,
  scvWarehouse,
  scvTracking,
  scvClassification,
  scvClearance,
  cmsExpense,
  cmsBilling,
  cmsTradeitem,
  cmsHsCode,
  crmCustomers,
  crmOrders,
  crmBilling,
  cwmReceive,
  cwmWarehouse,
  cwmContext,
  cwmTransaction,
  cwmSku,
  cwmShFtz,
});
