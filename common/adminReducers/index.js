import { combineReducers } from 'redux';
import auth from '../reducers/auth';
import account from '../reducers/account';
import navbar from '../reducers/navbar';
import intl from '../reducers/intl';
import corpDomain from '../reducers/corp-domain';

export default combineReducers({
  intl,
  auth,
  account,
  navbar,
  corpDomain
});
