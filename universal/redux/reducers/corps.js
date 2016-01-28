import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { CHINA_CODE, TENANT_ROLE } from '../../../universal/constants';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, clearFormC,
  setFormValueC } from '../../../reusable/domains/redux/form-common';
import { PERSONNEL_EDIT_SUCCEED } from './personnel';
const actionTypes = createActionTypes('@@welogix/corps/', [
  'IMG_UPLOAD', 'IMG_UPLOAD_SUCCEED', 'IMG_UPLOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'SWITCH_APP', 'SWITCH_APP_SUCCEED', 'SWITCH_APP_FAIL',
  'CORP_SUBMIT', 'CORP_SUBMIT_SUCCEED', 'CORP_SUBMIT_FAIL',
  'CORP_DELETE', 'CORP_DELETE_SUCCEED', 'CORP_DELETE_FAIL',
  'CORP_EDIT', 'CORP_EDIT_SUCCEED', 'CORP_EDIT_FAIL',
  'CORPS_LOAD', 'CORPS_LOAD_SUCCEED', 'CORPS_LOAD_FAIL',
  'ORGAN_FORM_LOAD', 'ORGAN_FORM_LOAD_SUCCEED', 'ORGAN_FORM_LOAD_FAIL',
  'EDIT_ORGAN', 'EDIT_ORGAN_SUCCEED', 'EDIT_ORGAN_FAIL',
  'CHECK_LOGINNAME', 'CHECK_LOGINNAME_SUCCEED', 'CHECK_LOGINNAME_FAIL'
]);
appendFormAcitonTypes('@@welogix/corps/', actionTypes);

export const CORP_EDIT_SUCCEED = actionTypes.CORP_EDIT_SUCCEED;
export const CORP_SUBMIT_SUCCEED = actionTypes.CORP_SUBMIT_SUCCEED;
export const CORP_DELETE_SUCCEED = actionTypes.CORP_DELETE_SUCCEED;
export const EDIT_ORGAN_SUCCEED = actionTypes.EDIT_ORGAN_SUCCEED;
const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  selectedIndex: -1,
  formData: {
    poid: '',
    coid: '',
    country: CHINA_CODE
  },
  corpUsers: [],
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
      if (action.data.personnel.role === TENANT_ROLE.owner.name) {
        // 修改租户拥有者需重新加载租户列表
        return { ...state, loaded: false, formData: initialState.formData };
      } else {
        return state;
      }
      break;
    case actionTypes.SWITCH_STATUS_SUCCEED: {
      const corplist = { ...state.corplist };
      corplist.data[action.index].status = action.data.status;
      return { ...state, corplist };
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
        // todo written map filter
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
    case actionTypes.ORGAN_FORM_LOAD_SUCCEED: {
      const actresult = action.result.data;
      const formData = {
        key: actresult.tenant.tid,
        name: actresult.tenant.name,
        coid: `${actresult.tenant.uid}`,
        poid: `${actresult.tenant.uid}`
      };
      return { ...state, corpUsers: actresult.users, formData };
    }
    case actionTypes.EDIT_ORGAN_SUCCEED: {
      const corps = state.corplist.data.map(corp => corp.key === action.data.corp.key ?
        { ...corp, ...action.result.data } : corp);
      return { ...state, corplist: { ...state.corplist, data: corps },
        formData: initialState.formData, corpUsers: [] };
    }
    case actionTypes.CORPS_LOAD:
      return { ...state, loading: true, needUpdate: false };
    case actionTypes.CORPS_LOAD_SUCCEED: {
      const corplist = { ...state.corplist, ...action.result.data };
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
      types: [actionTypes.CORP_DELETE, actionTypes.CORP_DELETE_SUCCEED,
        actionTypes.CORP_DELETE_FAIL],
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
      types: [actionTypes.CORP_SUBMIT, actionTypes.CORP_SUBMIT_SUCCEED,
        actionTypes.CORP_SUBMIT_FAIL],
      endpoint: 'v1/user/corp',
      method: 'post',
      data: { corp, tenant }
    }
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
      params: { corpId }
    }
  };
}

export function editOrganization(corp) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.EDIT_ORGAN, actionTypes.EDIT_ORGAN_SUCCEED, actionTypes.EDIT_ORGAN_FAIL],
      endpoint: 'v1/user/organization',
      method: 'put',
      data: { corp }
    }
  };
}
export function isFormDataLoaded(corpsState, corpId) {
  return isFormDataLoadedC(corpId, corpsState, 'corplist');
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
      data: { tenantId, checked, app }
    }
  };
}
