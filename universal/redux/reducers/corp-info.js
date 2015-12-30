import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
const actionTypes = createActionTypes('@@qm-auth/corp-info/', [
  'CHANGE_CORP_VALUE', 'CORP_UPLOAD_PIC', 'CORP_UPLOAD_SUCCEED', 'CORP_UPLOAD_FAIL',
  'CORP_SUBMIT', 'CORP_SUBMIT_SUCCEED', 'CORP_SUBMIT_FAIL',
  'CORP_LOAD', 'CORP_LOAD_SUCCEED', 'CORP_LOAD_FAIL']);

const initialState = {
  loaded: false,
  readonly: false,
  isTenant: true,
  thisCorp: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case actionTypes.CHANGE_CORP_VALUE: {
    const thisCorp = { ...state.thisCorp };
    thisCorp[action.data.field] = action.data.value;
    return { ...state, thisCorp };
  }
  case actionTypes.CORP_UPLOAD_SUCCEED: {
    const thisCorp = { ...state.thisCorp };
    thisCorp[action.field] = action.result.data;
    return { ...state, thisCorp };
  }
  case actionTypes.CORP_LOAD_SUCCEED:
    return { ...state, loaded: true, ...action.result.data.corpInfo };
  default:
    return state;
  }
}

export function changeThisCorpValue(field, newValue) {
  return {
    type: actionTypes.CHANGE_CORP_VALUE,
    data: { field, value: newValue }
  };
}

export function uploadCorpPics(field, pics) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_UPLOAD_PIC, actionTypes.CORP_UPLOAD_SUCCEED, actionTypes.CORP_UPLOAD_FAIL],
      endpoint: 'v1/upload/pics',
      method: 'post',
      files: pics,
      field
    }
  };
}

export function submitCorp(corp, urlpath) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_SUBMIT, actionTypes.CORP_SUBMIT_SUCCEED, actionTypes.CORP_SUBMIT_FAIL],
      endpoint: urlpath.slice(1),
      method: 'put',
      data: { corp }
    }
  };
}

export function isLoaded(state) {
  return state.corpInfo && state.corpInfo.loaded;
}

export function loadCorpInfo(cookie) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.CORP_LOAD, actionTypes.CORP_LOAD_SUCCEED, actionTypes.CORP_LOAD_FAIL ],
      endpoint: 'v1/user/corp',
      method: 'get',
      cookie
    }
  };
}
