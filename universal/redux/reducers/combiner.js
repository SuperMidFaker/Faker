import { combineReducers } from 'redux';
import auth from './auth';
import account from './account';
import navbar from './navbar';
import corpDomain from './corp-domain';
import corps from './corps';
import personnel from './personnel';
import warehouse from './warehouse';
import importdelegate from './importdelegate';
import bill from './bill';
import notice from './notice';

export default combineReducers({
  auth,
  account,
  navbar,
  corpDomain,
  corps,
  personnel,
  warehouse,
  importdelegate,
  bill,
  notice
});
