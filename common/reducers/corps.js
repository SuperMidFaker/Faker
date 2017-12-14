import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { CHINA_CODE, PRESET_TENANT_ROLE } from '../constants';
import { appendFormAcitonTypes, formReducer, loadFormC, clearFormC, setFormValueC } from
  './form-common';
import { PERSONNEL_EDIT_SUCCEED } from './personnel';
const actionTypes = createActionTypes('@@welogix/corps/', [
  'OPEN_TENANT_APPS_EDITOR', 'CLOSE_TENANT_APPS_EDITOR',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'SWITCH_APP', 'SWITCH_APP_SUCCEED', 'SWITCH_APP_FAIL',
  'CORP_EDIT', 'CORP_EDIT_SUCCEED', 'CORP_EDIT_FAIL',
  'ORGANS_LOAD', 'ORGANS_LOAD_SUCCEED', 'ORGANS_LOAD_FAIL',
  'ORGAN_FORM_LOAD', 'ORGAN_FORM_LOAD_SUCCEED', 'ORGAN_FORM_LOAD_FAIL',
  'ORGAN_EDIT', 'ORGAN_EDIT_SUCCEED', 'ORGAN_EDIT_FAIL',
  'CORP_SUBMIT', 'CORP_SUBMIT_SUCCEED', 'CORP_SUBMIT_FAIL',
  'CORP_DELETE', 'CORP_DELETE_SUCCEED', 'CORP_DELETE_FAIL',
  'CHECK_LOGINNAME', 'CHECK_LOGINNAME_SUCCEED', 'CHECK_LOGINNAME_FAIL',
  'GET_TENANT_LOGINS', 'GET_TENANT_LOGINS_SUCCEED', 'GET_TENANT_LOGINS_FAIL',
]);
appendFormAcitonTypes('@@welogix/corps/', actionTypes);

export const CORP_EDIT_SUCCEED = actionTypes.CORP_EDIT_SUCCEED;
export const CORP_SUBMIT_SUCCEED = actionTypes.CORP_SUBMIT_SUCCEED;
export const CORP_DELETE_SUCCEED = actionTypes.CORP_DELETE_SUCCEED;
export const ORGAN_EDIT_SUCCEED = actionTypes.ORGAN_EDIT_SUCCEED;
export const INITIAL_LIST_PAGE_SIZE = 5;
const initialState = {
  loaded: false,
  loading: false,
  submitting: false,
  selectedIndex: -1,
  formData: {
    poid: '',
    coid: '',
    country: CHINA_CODE,
  },
  appEditor: {
    tenantApps: [],
    tenantId: -1,
    index: -1,
    visible: false,
  },
  corpUsers: [],
  corplist: {
    tenantAppPackage: [],
    totalCount: 0,
    pageSize: INITIAL_LIST_PAGE_SIZE,
    current: 1,
    data: [], // structure see getOrganizations
  },
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    // corp/info
    case actionTypes.CORP_EDIT_SUCCEED: {
      if (state.selectedIndex !== -1) {
        const corplist = { ...state.corplist };
        corplist.data[state.selectedIndex] = action.data.corp;
        return { ...state, selectedIndex: -1, corplist };
      } else {
        return { ...state, formData: action.data.corp };
      }
    }
    // organization
    case PERSONNEL_EDIT_SUCCEED:
      if (action.data.personnel.role === PRESET_TENANT_ROLE.owner.name) {
        // 修改租户拥有者需重新加载租户列表
        return { ...state, loaded: false, formData: initialState.formData };
      } else {
        return state;
      }
    case actionTypes.ORGAN_FORM_LOAD_SUCCEED: {
      const actresult = action.result.data;
      const formData = {
        key: actresult.tenant.tid,
        subCode: actresult.tenant.subCode,
        name: actresult.tenant.name,
        coid: `${actresult.tenant.uid}`,
        poid: `${actresult.tenant.uid}`,
      };
      return { ...state, corpUsers: actresult.users, formData };
    }
    case actionTypes.ORGANS_LOAD:
      return { ...state, loading: true };
    case actionTypes.ORGANS_LOAD_SUCCEED: {
      const corplist = { ...state.corplist, ...action.result.data };
      return {
        ...state, loading: false, loaded: true, corplist,
      };
    }
    case actionTypes.ORGANS_LOAD_FAIL:
      return { ...state, loading: false };
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
        corplist.data[action.index].apps = corplist.data[action.index].apps.filter(app => app.id !== action.data.app.id);
      }
      return {
        ...state,
        corplist,
        appEditor: {
          ...state.appEditor,
          tenantApps:
        corplist.data[action.index].apps,
        },
      };
    }
    case actionTypes.OPEN_TENANT_APPS_EDITOR:
      return { ...state, appEditor: action.tenantAppInfo };
    case actionTypes.CLOSE_TENANT_APPS_EDITOR:
      return { ...state, appEditor: initialState.appEditor };
    case actionTypes.ORGAN_EDIT:
    case actionTypes.CORP_SUBMIT:
      return { ...state, submitting: true };
    case actionTypes.ORGAN_EDIT_SUCCEED: {
      const corps = state.corplist.data.map(corp => corp.key === action.data.corp.key ?
        { ...corp, ...action.result.data } : corp);
      return {
        ...state,
        corplist: { ...state.corplist, data: corps },
        formData: initialState.formData,
        corpUsers: [],
        submitting: false,
      };
    }
    case actionTypes.CORP_SUBMIT_SUCCEED: {
      const corplist = { ...state.corplist };
      if ((corplist.current - 1) * corplist.pageSize <= corplist.totalCount // '=' because of totalCount 0
          && corplist.current * corplist.pageSize > corplist.totalCount) {
        corplist.data.push(action.result.data);
      }
      corplist.totalCount++;
      return { ...state, corplist, submitting: false };
    }
    case actionTypes.ORGAN_EDIT_FAIL:
    case actionTypes.CORP_SUBMIT_FAIL:
      return { ...state, submitting: false };
    case actionTypes.CORP_DELETE_SUCCEED: {
      const corplist = { ...state.corplist };
      corplist.totalCount--;
      return { ...state, corplist };
    }
    default:
      return formReducer(actionTypes, state, action, { key: null, country: CHINA_CODE }, 'corplist')
             || state;
  }
}

export function delCorp(corpId, parentTenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_DELETE, actionTypes.CORP_DELETE_SUCCEED,
        actionTypes.CORP_DELETE_FAIL],
      endpoint: 'v1/user/corp',
      method: 'del',
      data: { corpId, parentTenantId },
    },
  };
}

export function edit(corp) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_EDIT, actionTypes.CORP_EDIT_SUCCEED, actionTypes.CORP_EDIT_FAIL],
      endpoint: 'v1/user/corp',
      method: 'put',
      data: { corp },
    },
  };
}

export function submit(corp, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_SUBMIT, actionTypes.CORP_SUBMIT_SUCCEED,
        actionTypes.CORP_SUBMIT_FAIL],
      endpoint: 'v1/user/corp',
      method: 'post',
      data: { corp, tenant },
    },
  };
}

export function loadOrganizationForm(cookie, corpId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ORGAN_FORM_LOAD, actionTypes.ORGAN_FORM_LOAD_SUCCEED,
        actionTypes.ORGAN_FORM_LOAD_FAIL],
      endpoint: 'v1/user/organization',
      method: 'get',
      cookie,
      params: { corpId },
    },
  };
}

export function editOrganization(corp) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ORGAN_EDIT, actionTypes.ORGAN_EDIT_SUCCEED, actionTypes.ORGAN_EDIT_FAIL],
      endpoint: 'v1/user/organization',
      method: 'put',
      data: { corp },
    },
  };
}

export function isFormDataLoaded(corpsState, corpId) {
  return corpsState.formData.key === corpId;
}

export function loadForm(cookie, corpId) {
  return loadFormC(cookie, 'v1/user/corp', { corpId }, actionTypes);
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
      params: { loginName, loginId, tenantId },
    },
  };
}

export function switchStatus(index, tenantId, status) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_STATUS, actionTypes.SWITCH_STATUS_SUCCEED, actionTypes.SWITCH_STATUS_FAIL],
      endpoint: 'v1/user/corp/status',
      method: 'put',
      index,
      data: { status, tenantId },
    },
  };
}

export function loadOrgans(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ORGANS_LOAD, actionTypes.ORGANS_LOAD_SUCCEED, actionTypes.ORGANS_LOAD_FAIL],
      endpoint: 'v1/user/organizations',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function switchTenantApp(tenantId, checked, app, index) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_APP, actionTypes.SWITCH_APP_SUCCEED, actionTypes.SWITCH_APP_FAIL],
      endpoint: 'v1/user/corp/app',
      method: 'post',
      index,
      data: { tenantId, checked, app },
    },
  };
}

export function openTenantAppsEditor(record, index) {
  return {
    type: actionTypes.OPEN_TENANT_APPS_EDITOR,
    tenantAppInfo: {
      visible: true,
      tenantId: record.key,
      tenantApps: record.apps,
      index,
    },
  };
}

export function closeTenantAppsEditor() {
  return {
    type: actionTypes.CLOSE_TENANT_APPS_EDITOR,
  };
}

export function getTenantUsers(tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.GET_TENANT_LOGINS, actionTypes.GET_TENANT_LOGINS_SUCCEED, actionTypes.GET_TENANT_LOGINS_FAIL],
      endpoint: 'v1/user/corp/tenant/users',
      method: 'get',
      params: { tenantId },
    },
  };
}
