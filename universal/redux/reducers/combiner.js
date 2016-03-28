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
import warehouse from './warehouse';
import bill from './bill';
import notice from './notice';
import delegate from './delegate';

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
  bill,
  notice,
  delegate,
  importaccept
});
