import { combineReducers } from 'redux';
import auth from './auth';
import account from './account';
import navbar from './navbar';
import corpDomain from './corp-domain';
import corps from './corps';
import personnel from './personnel';
import partner from './partner';
import invitation from './invitation';
import importdelegate from './importdelegate';
import task from './task';
import warehouse from './warehouse';
import bill from './bill';
import notice from './notice';
import delegate from './delegate';

export default combineReducers({
  auth,
  account,
  navbar,
  corpDomain,
  corps,
  personnel,
  partner,
  invitation,
  warehouse,
  importdelegate,
  task,
  bill,
  notice,
  delegate
});
