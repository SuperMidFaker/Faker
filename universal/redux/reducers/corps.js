import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { CHINA_CODE } from '../../../universal/constants';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC, setFormValueC } from '../../../reusable/domains/redux/form-common';
import { PERSONNEL_EDIT_SUCCEED } from './personnel';
const actionTypes = createActionTypes('@@welogix/corps/', [
  'IMG_UPLOAD', 'IMG_UPLOAD_SUCCEED', 'IMG_UPLOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'SWITCH_APP', 'SWITCH_APP_SUCCEED', 'SWITCH_APP_FAIL',
  'CORP_SUBMIT', 'CORP_SUBMIT_SUCCEED', 'CORP_SUBMIT_FAIL',
  'CORP_DELETE', 'CORP_DELETE_SUCCEED', 'CORP_DELETE_FAIL',
  'CORP_EDIT', 'CORP_EDIT_SUCCEED', 'CORP_EDIT_FAIL',
  'CORPS_LOAD', 'CORPS_LOAD_SUCCEED', 'CORPS_LOAD_FAIL',
  'CHECK_LOGINNAME', 'CHECK_LOGINNAME_SUCCEED', 'CHECK_LOGINNAME_FAIL'
]);
appendFormAcitonTypes('@@welogix/corps/', actionTypes);

export const CORP_EDIT_SUCCEED = actionTypes.CORP_EDIT_SUCCEED;
const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  selectedIndex: -1,
  formData: {
    country: CHINA_CODE
  },
  corplist: {
    tenantAppPackage: [],
    totalCount: 0,
    pageSize: 5,
    current: 1,
    data: []
  }
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PERSONNEL_EDIT_SUCCEED:
      // 租户用户修改有可能租房拥有者信息改变需重新加载
      return { ...state, loaded: false };
    case actionTypes.SWITCH_STATUS_SUCCEED: {
      const corplist = { ...state.corplist };
      corplist.data[action.index].status = action.data.status;
      return {...state, corplist};
    }
    case actionTypes.IMG_UPLOAD_SUCCEED: {
      const form = { ...state.formData };
      form[action.field] = action.result.data;
      return { ...state, formData: form };
    }
    case actionTypes.SWITCH_APP_SUCCEED: {
      const corplist = {...state.corplist};
      if (action.data.checked) {
        corplist.data[action.index].apps.push(action.data.app);
      } else {
        let appIndex = -1;
        corplist.data[action.index].apps.forEach((app, index) => {
          if (app.id === action.data.app.id) {
            appIndex = index;
            return;
          }
        });
        corplist.data[action.index].apps.splice(appIndex, 1);
      }
      return {...state, corplist};
    }
    case actionTypes.CORPS_LOAD:
      return { ...state, loading: true, needUpdate: false };
    case actionTypes.CORPS_LOAD_SUCCEED: {
      const corplist = {...state.corplist, ...action.result.data};
      return {...state, loading: false, loaded: true, corplist};
    }
    case actionTypes.CORPS_LOAD_FAIL:
      return { ...state, loading: false };
    case actionTypes.CORP_EDIT_SUCCEED: {
      if (state.selectedIndex !== -1) {
        const corplist = {...state.corplist};
        corplist.data[state.selectedIndex] = action.data.corp;
        return {...state, selectedIndex: -1, corplist};
      }
    }
    case actionTypes.CORP_DELETE_SUCCEED: {
      const corplist = { ...state.corplist };
      corplist.totalCount--;
      return { ...state, corplist, needUpdate: true };
    }
    case actionTypes.CORP_SUBMIT_SUCCEED: {
      const corplist = { ...state.corplist };
      if ((corplist.current - 1) * corplist.pageSize <= corplist.totalCount // '=' because of totalCount 0
          && corplist.current * corplist.pageSize > corplist.totalCount) {
        corplist.data.push(action.result.data);
      }
      corplist.totalCount++;
      return { ...state, corplist };
    }
    // todo deal with submit fail submit loading
    default:
      return formReducer(actionTypes, state, action, { key: null, country: CHINA_CODE }, 'corplist')
             || state;
  }
}

export function delCorp(corpId, parentTenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_DELETE, actionTypes.CORP_DELETE_SUCCEED, actionTypes.CORP_DELETE_FAIL],
      endpoint: 'v1/user/corp',
      method: 'del',
      data: { corpId, parentTenantId }
    }
  };
}

export function edit(corp) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_EDIT, actionTypes.CORP_EDIT_SUCCEED, actionTypes.CORP_EDIT_FAIL],
      endpoint: 'v1/user/corp',
      method: 'put',
      data: { corp }
    }
  };
}

export function uploadImg(field, pics) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.IMG_UPLOAD, actionTypes.IMG_UPLOAD_SUCCEED, actionTypes.IMG_UPLOAD_FAIL],
      endpoint: 'v1/upload/img',
      method: 'post',
      files: pics,
      field
    }
  };
}

export function submit(corp, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_SUBMIT, actionTypes.CORP_SUBMIT_SUCCEED, actionTypes.CORP_SUBMIT_FAIL],
      endpoint: 'v1/user/corp',
      method: 'post',
      data: { corp, tenant }
    }
  };
}

export function isFormDataLoaded(corpsState, corpId) {
  return isFormDataLoadedC(corpId, corpsState, 'corplist');
}

export function loadForm(cookie, corpId) {
  return loadFormC(cookie, 'v1/user/corp', {corpId}, actionTypes);
}

export function assignForm(corpsState, corpId) {
  return assignFormC(corpId, corpsState, 'corplist', actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}

export function checkLoginName(loginName, loginId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CHECK_LOGINNAME, actionTypes.CHECK_LOGINNAME_SUCCEED, actionTypes.CHECK_LOGINNAME_FAIL],
      endpoint: 'v1/user/check/loginname',
      method: 'get',
      params: {loginName, loginId, tenantId}
    }
  };
}

export function switchStatus(index, tenantId, status) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_STATUS, actionTypes.SWITCH_STATUS_SUCCEED, actionTypes.SWITCH_STATUS_FAIL],
      endpoint: 'v1/user/corp/status',
      method: 'put',
      index,
      data: {status, tenantId}
    }
  };
}

export function loadCorps(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORPS_LOAD, actionTypes.CORPS_LOAD_SUCCEED, actionTypes.CORPS_LOAD_FAIL],
      endpoint: 'v1/user/corps',
      method: 'get',
      params,
      cookie
    }
  };
}

export function switchTenantApp(tenantId, checked, app, index) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_APP, actionTypes.SWITCH_APP_SUCCEED, actionTypes.SWITCH_APP_FAIL],
      endpoint: 'v1/user/corp/app',
      method: 'post',
      index,
      data: {tenantId, checked, app}
    }
  };
}
