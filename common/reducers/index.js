import { combineReducers } from 'redux';
import intl from './intl';
import auth from './auth';
import account from './account';
import weixin from './weixin';
import chinaRegions from './chinaRegions';
import navbar from './navbar';
import corpDomain from './corp-domain';
import corps from './corps';
import personnel from './personnel';
import partner from './partner';
import role from './role';
import invitation from './invitation';
import transportAcceptance from './transport-acceptance';
import trackingLandStatus from './trackingLandStatus';
import trackingLandPod from './trackingLandPod';
import trackingLandException from './trackingLandException';
import shipment from './shipment';
import transportDispatch from './transportDispatch';
import transportResources from './transportResources';
import transportTariff from './transportTariff';
import transportBilling from './transportBilling';
import cmsDelegation from './cmsDelegation';
import cmsDeclare from './cmsDeclare';
import cmsCompRelation from './cmsCompRelation';
import cmsQuote from './cmsQuote';
import scvinbound from './scvinbound';
import cmsExpense from './cmsExpense';

export default combineReducers({
  intl,
  auth,
  account,
  weixin,
  chinaRegions,
  navbar,
  corpDomain,
  corps,
  personnel,
  partner,
  role,
  invitation,
  shipment,
  transportAcceptance,
  trackingLandStatus,
  trackingLandPod,
  trackingLandException,
  transportDispatch,
  transportResources,
  transportTariff,
  transportBilling,
  cmsDelegation,
  cmsDeclare,
  cmsCompRelation,
  cmsQuote,
  scvinbound,
  cmsExpense,
});
