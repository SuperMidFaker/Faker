import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { CHINA_CODE } from '../../../universal/constants';
const actionTypes = createActionTypes('@@welogix/corps/', [
  'FORM_LOAD', 'FORM_LOAD_SUCCEED', 'FORM_LOAD_FAIL',
  'FORM_ASSIGN', 'FORM_CLEAR', 'SET_FORM_VALUE',
  'IMG_UPLOAD', 'IMG_UPLOAD_SUCCEED', 'IMG_UPLOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'CORP_SUBMIT', 'CORP_SUBMIT_SUCCEED', 'CORP_SUBMIT_FAIL',
  'CORP_DELETE', 'CORP_DELETE_SUCCEED', 'CORP_DELETE_FAIL',
  'CORP_EDIT', 'CORP_EDIT_SUCCEED', 'CORP_EDIT_FAIL',
  'CORPS_LOAD', 'CORPS_LOAD_SUCCEED', 'CORPS_LOAD_FAIL',
  'CHECK_LOGINNAME', 'CHECK_LOGINNAME_SUCCEED', 'CHECK_LOGINNAME_FAIL',
  'CHECK_CORP_DOMAIN', 'CHECK_DOMAIN_SUCCEED', 'CHECK_DOMAIN_FAIL'
]);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  selectedIndex: -1,
  formData: {
    country: CHINA_CODE
  },
  corplist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  }
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
  case actionTypes.FORM_ASSIGN: {
    if (action.index !== -1) {
      return {...state, selectedIndex: action.index, formData: state.corplist.data[action.index]};
    } else {
      return {...state, selectedIndex: action.index};
    }
  }
  case actionTypes.FORM_CLEAR:
    return {...state, selectedIndex: -1, formData: initialState.formData};
  case actionTypes.FORM_LOAD_SUCCEED:
    return {...state, formData: action.result.data};
  case actionTypes.SET_FORM_VALUE: {
    const form = { ...state.formData };
    form[action.data.field] = action.data.value;
    return { ...state, formData: form };
  }
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
    return { ...state, needUpdate: true };
  }
  case actionTypes.CORP_SUBMIT_SUCCEED: {
    const corplist = {...state.corplist};
    if ((corplist.current - 1) * corplist.pageSize <= corplist.totalCount // '=' because of totalCount 0
        && corplist.current * corplist.pageSize > corplist.totalCount) {
      corplist.data.push(action.result.data);
    }
    corplist.totalCount++;
    return { ...state, corplist};
  }
  // todo deal with submit fail submit loading
  default:
    return state;
  }
}

export function delCorp(corpId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_DELETE, actionTypes.CORP_DELETE_SUCCEED, actionTypes.CORP_DELETE_FAIL],
      endpoint: 'v1/user/corp',
      method: 'del',
      data: {corpId}
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
  let loaded = corpsState.formData.key === corpId;
  corpsState.corplist.data.forEach((corp) => {
    if (corp.key === corpId) {
      loaded = true;
      return;
    }
  });
  return loaded;
}

export function loadForm(cookie, corpId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.FORM_LOAD, actionTypes.FORM_LOAD_SUCCEED, actionTypes.FORM_LOAD_FAIL],
      endpoint: 'v1/user/corp',
      method: 'get',
      params: {corpId},
      cookie
    }
  };
}

export function assignForm(corpsState, corpId) {
  let index = -1;
  corpsState.corplist.data.forEach((c, idx)=> {
    if (c.key === corpId) {
      index = idx;
      return;
    }
  });
  return {
    type: actionTypes.FORM_ASSIGN,
    index
  };
}

export function clearForm() {
  return {
    type: actionTypes.FORM_CLEAR
  };
}

export function setFormValue(field, newValue) {
  return {
    type: actionTypes.SET_FORM_VALUE,
    data: { field, value: newValue }
  };
}

export function checkCorpDomain(subdomain, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CHECK_CORP_DOMAIN, actionTypes.CHECK_DOMAIN_SUCCEED, actionTypes.CHECK_DOMAIN_FAIL],
      endpoint: 'v1/user/corp/check/subdomain',
      method: 'get',
      params: {subdomain, tenantId}
    }
  };
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
