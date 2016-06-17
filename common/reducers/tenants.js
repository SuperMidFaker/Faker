import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { CHINA_CODE } from '../constants';
import { appendFormAcitonTypes, formReducer, loadFormC, clearFormC, setFormValueC } from
'./form-common';
const actionTypes = createActionTypes('@@welogix/corps/', [
  'OPEN_TENANT_APPS_EDITOR', 'CLOSE_TENANT_APPS_EDITOR',
  'IMG_UPLOAD', 'IMG_UPLOAD_SUCCEED', 'IMG_UPLOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'SWITCH_APP', 'SWITCH_APP_SUCCEED', 'SWITCH_APP_FAIL',
  'CHECK_LOGINNAME', 'CHECK_LOGINNAME_SUCCEED', 'CHECK_LOGINNAME_FAIL',
  'GET_TENANTAPP', 'GET_TENANTAPP_SUCCEED', 'GET_TENANTAPP_FAIL',
  'TENANTS_LOAD', 'TENANTS_LOAD_SUCCEED', 'TENANTS_LOAD_FAIL',
  'TENANT_FORM_LOAD', 'TENANT_FORM_LOAD_SUCCEED', 'TENANT_FORM_LOAD_FAIL',
  'TENANT_NEW', 'TENANT_NEW_SUCCEED', 'TENANT_NEW_FAIL',
  'TENANT_DELETE', 'TENANT_DELETE_SUCCEED', 'TENANT_DELETE_FAIL',
]);
appendFormAcitonTypes('@@welogix/corps/', actionTypes);

export const INITIAL_LIST_PAGE_SIZE = 10;
const initialState = {
  loaded: false,
  loading: false,
  submitting: false,
  selectedIndex: -1,
  formData: {
    name: '',
    code: '',
    subdomain: '',
    phone: '',
    tenantAppValueList: [],
    aspect: 0,
    email: '',
    logo: ''
  },
  tenantAppList: [],
  corplist: {
    totalCount: 0,
    pageSize: INITIAL_LIST_PAGE_SIZE,
    current: 1,
    data: [],
  },
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    // corp/info
    case actionTypes.IMG_UPLOAD_SUCCEED: {
      const form = { ...state.formData };
      form[action.field] = action.result.data;
      return { ...state, formData: form };
    }
    // organization
    case actionTypes.TENANTS_LOAD: {
      return { ...state, loading: true };
    }
    case actionTypes.TENANTS_LOAD_SUCCEED: {
      const corplist = { ...state.corplist };
      corplist.data = action.result.data;
      return {...state, loading: false, loaded: true, corplist};
    }
    case actionTypes.TENANT_FORM_LOAD_SUCCEED: {
      const formData = action.result.data[0];
      return { ...state, loading: false, loaded: true, formData };
    }
    case actionTypes.SWITCH_STATUS_SUCCEED: {
      const corplist = { ...state.corplist };
      corplist.data[action.index].status = action.data.status;
      return { ...state, corplist };
    }
    case actionTypes.SWITCH_APP_SUCCEED: {
      const corplist = { ...state.corplist };
      if (action.data.checked) {
        // DO NOT use push because apps is shallow copied, DO NOT modify state
        corplist.data[action.index].apps = [...corplist.data[action.index].apps, action.data.app];
      } else {
        corplist.data[action.index].apps = corplist.data[action.index].apps.filter(
          app => app.id !== action.data.app.id);
      }
      return { ...state, corplist, appEditor: { ...state.appEditor, tenantApps:
        corplist.data[action.index].apps } };
    }
    case actionTypes.GET_TENANTAPP: {
      return { ...state };
    }
    case actionTypes.GET_TENANTAPP_SUCCEED: {
      return { ...state, tenantAppList: action.result.data };
    }
    case actionTypes.GET_TENANTAPP_FAIL: {
      return { ...state };
    }
    case actionTypes.TENANT_NEW: {
      return { ...state };
    }
    case actionTypes.TENANT_NEW_SUCCEED: {
      return { ...state };
    }
    case actionTypes.TENANT_NEW_FAIL: {
      return { ...state };
    }
    case actionTypes.TENANT_DELETE_SUCCEED: {
      return { ...state };
    }
    default:
      return formReducer(actionTypes, state, action, { key: null, country: CHINA_CODE }, 'corplist')
             || state;
  }
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

export function isFormDataLoaded(corpsState, corpId) {
  return corpsState.formData.key === corpId;
}

export function loadForm(cookie, corpId) {
  return loadFormC(cookie, 'v1/user/corp', {corpId}, actionTypes);
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
      params: { loginName, loginId, tenantId }
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
      data: { status, tenantId }
    }
  };
}

export function getTenantAppList() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.GET_TENANTAPP, actionTypes.GET_TENANTAPP_SUCCEED, actionTypes.GET_TENANTAPP_FAIL],
      endpoint: 'v1/user/corp/tenant/getTenantAppList',
      method: 'get'
    }
  };
}
export function loadTenants(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TENANTS_LOAD, actionTypes.TENANTS_LOAD_SUCCEED, actionTypes.TENANTS_LOAD_FAIL],
      endpoint: 'v1/user/corp/tenants',
      method: 'get',
      params,
      cookie
    }
  };
}

export function loadTenantForm(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TENANT_FORM_LOAD, actionTypes.TENANT_FORM_LOAD_SUCCEED, actionTypes.TENANT_FORM_LOAD_FAIL],
      endpoint: `v1/user/corp/tenant/${params}`,
      method: 'get',
      cookie
    }
  };
}

export function delTenant(tenantId, loginId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TENANT_DELETE, actionTypes.TENANT_DELETE_SUCCEED,
        actionTypes.TENANT_DELETE_FAIL],
      endpoint: 'v1/user/corp/tenant/delete',
      method: 'del',
      data: { tenantId, loginId }
    }
  };
}

export function submitTenant(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TENANT_NEW, actionTypes.TENANT_NEW_SUCCEED, actionTypes.TENANT_NEW_FAIL],
      endpoint: 'v1/user/corp/tenant/upsert',
      method: 'put',
      data: params
    }
  };
}
