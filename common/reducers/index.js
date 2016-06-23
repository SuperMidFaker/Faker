import { combineReducers } from 'redux';
import intl from './intl';
import auth from './auth';
import account from './account';
import weixin from './weixin';
import navbar from './navbar';
import corpDomain from './corp-domain';
import corps from './corps';
import personnel from './personnel';
import partner from './partner';
import invitation from './invitation';
import importdelegate from './importdelegate';
import importaccept from './importaccept';
import exportaccept from './exportaccept';
import task from './task';
import transportAcceptance from './transport-acceptance';
import trackingLandStatus from './trackingLandStatus';
import trackingLandPod from './trackingLandPod';
import trackingLandException from './trackingLandException';
import shipment from './shipment';
import warehouse from './warehouse';
import bill from './bill';
import notice from './notice';
import delegate from './delegate';
import exportdelegate from './exportdelegate';
import exporttask from './exporttask';
import importtracking from './importtracking';
import exporttracking from './exporttracking';
import transportDispatch from './transportDispatch';
import transportResources from './transportResources';
import cmsDelcare from './cmsDeclare';
import cms from './cms';
import cmsDelegation from './cmsDelegation';

export default combineReducers({
  intl,
  auth,
  account,
  weixin,
  navbar,
  corpDomain,
  corps,
  personnel,
  partner,
  invitation,
  warehouse,
  importdelegate,
  exportaccept,
  task,
  shipment,
  transportAcceptance,
  trackingLandStatus,
  trackingLandPod,
  trackingLandException,
  bill,
  notice,
  delegate,
  importaccept,
  exportdelegate,
  exporttask,
  importtracking,
  exporttracking,
  transportDispatch,
  transportResources,
  cmsDelcare,
  cmsDelegation,
  cms,
  cmsDelegation
});
