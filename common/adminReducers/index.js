import { combineReducers } from 'redux';
import auth from '../reducers/auth';
import account from '../reducers/account';
import navbar from '../reducers/navbar';

export default combineReducers({
  auth,
  account,
  navbar,
});
