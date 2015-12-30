import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
const CHANGE_PERSONNEL_VALUE = '@@qm-auth/personnel-info/CHANGE_PERSONNEL_VALUE';
const PERSONNEL_SUBMIT = '@@qm-auth/personnel-info/PERSONNEL_SUBMIT';
const PERSONNEL_SUBMIT_SUCCEED = '@@qm-auth/personnel-info/PERSONNEL_SUBMIT_SUCCEED';
const PERSONNEL_SUBMIT_FAIL = '@@qm-auth/personnel-info/PERSONNEL_SUBMIT_FAIL';
const PERSONNEL_LOAD = '@@qm-auth/corp-info/PERSONNEL_LOAD';
const PERSONNEL_LOAD_SUCCEED = '@@qm-auth/corp-info/PERSONNEL_LOAD_SUCCEED';
const PERSONNEL_LOAD_FAIL = '@@qm-auth/corp-info/PERSONNEL_LOAD_FAIL';

const initialState = {
  loaded: false,
  readonly: true,
  thisPersonnel: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case CHANGE_PERSONNEL_VALUE: {
    const thisPersonnel = { ...state.thisPersonnel };
    thisPersonnel[action.data.field] = action.data.value;
    return { ...state, thisPersonnel };
  }
  case PERSONNEL_LOAD_SUCCEED:
    return { ...state, loaded: true, ...action.result.data.personnelInfo };
  default:
    return state;
  }
}

export function changeThisPersonnel(field, newValue) {
  return {
    type: CHANGE_PERSONNEL_VALUE,
    data: { field, value: newValue }
  };
}

export function submitPersonnel(personnel, urlpath) {
  return {
    [CLIENT_API]: {
      types: [PERSONNEL_SUBMIT, PERSONNEL_SUBMIT_SUCCEED, PERSONNEL_SUBMIT_FAIL],
      endpoint: urlpath.slice(1),
      method: 'put',
      data: { personnel }
    }
  };
}

export function isLoaded(state) {
  return state.personnelInfo && state.personnelInfo.loaded;
}

export function loadPersonnel(cookie) {
  return {
    [CLIENT_API]: {
      types: [ PERSONNEL_LOAD, PERSONNEL_LOAD_SUCCEED, PERSONNEL_LOAD_FAIL ],
      endpoint: 'v1/user/personnel',
      method: 'get',
      cookie
    }
  };
}
