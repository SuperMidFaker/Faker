import { combineReducers } from 'redux';
import auth from './auth';
import account from './account';
import corpDomain from './corp-domain';
import corps from './corps';
import personnel from './personnel';
import warehouse from './warehouse';
import bill from './bill';
import notice from './notice';

export default combineReducers({
  auth,
  account,
  corpDomain,
  corps,
  personnel,
  warehouse,
  bill,
  notice
});
