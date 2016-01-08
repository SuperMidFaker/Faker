import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { CHINA_CODE } from '../../../universal/constants';
const actionTypes = createActionTypes('@@welogix/corps/', [
  'FORM_LOAD', 'FORM_LOAD_SUCCEED', 'FORM_LOAD_FAIL',
  'MODAL_HIDE', 'MODAL_SHOW', 'CORP_BEGIN_EDIT', 'SET_FORM_VALUE',
  'IMG_UPLOAD', 'IMG_UPLOAD_SUCCEED', 'IMG_UPLOAD_FAIL',
  'CORP_SUBMIT', 'CORP_SUBMIT_SUCCEED', 'CORP_SUBMIT_FAIL',
  'CORP_DELETE', 'CORP_DELETE_SUCCEED', 'CORP_DELETE_FAIL',
  'CORP_EDIT', 'CORP_EDIT_SUCCEED', 'CORP_EDIT_FAIL',
  'CORP_LOAD', 'CORP_LOAD_SUCCEED', 'CORP_LOAD_FAIL',
  'CHECK_CORP_DOMAIN', 'CHECK_DOMAIN_SUCCEED', 'CHECK_DOMAIN_FAIL'
]);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  visible: false,
  selectIndex: -1,
  thisCorp: {
    type: 1,
    status: 'paid'
  },
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
  const curCorp = state.thisCorp;
  const plainCorp = { type: curCorp.type, status: curCorp.status };
  switch (action.type) {
  case actionTypes.FORM_LOAD_SUCCEED:
    return {...state, formData: action.result.data};
  case actionTypes.CORP_LOAD:
    return { ...state, loading: true, needUpdate: false };
  case actionTypes.CORP_LOAD_SUCCEED: {
    const corps = {...state.corps, ...action.result.data};
    return {...state, loading: false, loaded: true, corps};
  }
  case actionTypes.CORP_LOAD_FAIL:
    return { ...state, loading: false };
  case actionTypes.MODAL_HIDE:
    return { ...state, thisCorp: plainCorp, visible: false };
  case actionTypes.MODAL_SHOW:
    return { ...state, thisCorp: plainCorp, visible: true };
  case actionTypes.SET_FORM_VALUE: {
    const form = { ...state.formData };
    form[action.data.field] = action.data.value;
    return { ...state, formData: form };
  }
  case actionTypes.IMG_UPLOAD_SUCCEED: {
    const form = { ...state.formData };
    form[action.field] = action.result.data;
    return { ...state, formData: form };
  }
  case actionTypes.CORP_BEGIN_EDIT:
    return { ...state, thisCorp: { ...state.corps.data[action.data.index] }, visible: true, selectIndex: action.data.index };
  case actionTypes.CORP_EDIT_SUCCEED: {
    if (action.index) {
      const corps = {...state.corps};
      corps.data[action.index] = state.thisCorp;
      return { ...state, corps, thisCorp: plainCorp, visible: false };
    }
  }
  case actionTypes.CORP_DELETE_SUCCEED: {
    return { ...state, needUpdate: true };
  }
  case actionTypes.CORP_SUBMIT_SUCCEED: {
    const corps = {...state.corps};
    if ((corps.current - 1) * corps.pageSize <= corps.totalCount // '=' because of totalCount 0
        && corps.current * corps.pageSize > corps.totalCount) {
      corps.data.push({...action.data.corp, key: action.result.data.corpId,
                      status: action.result.data.status});
    }
    corps.totalCount++;
    return { ...state, corps, thisCorp: plainCorp, visible: false };
  }
  // todo deal with submit fail submit loading
  default:
    return state;
  }
}

export function hideModal() {
  return {
    type: actionTypes.MODAL_HIDE
  };
}

export function showModal() {
  return {
    type: actionTypes.MODAL_SHOW
  };
}

export function beginEditCorp(index) {
  return {
    type: actionTypes.CORP_BEGIN_EDIT,
    data: { index }
  };
}

export function delCorp(corpId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_DELETE, actionTypes.CORP_DELETE_SUCCEED, actionTypes.CORP_DELETE_FAIL],
      endpoint: 'v1/account/corp',
      method: 'del',
      data: {corpId}
    }
  };
}

export function edit(corp, index) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_EDIT, actionTypes.CORP_EDIT_SUCCEED, actionTypes.CORP_EDIT_FAIL],
      endpoint: 'v1/user/corp',
      method: 'put',
      index,
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

export function submit(corp) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_SUBMIT, actionTypes.CORP_SUBMIT_SUCCEED, actionTypes.CORP_SUBMIT_FAIL],
      endpoint: 'v1/account/corp',
      method: 'post',
      data: { corp }
    }
  };
}

export function isFormDataLoaded(corpsState, corpId) {
  let loaded = corpsState.formData.key === corpId;
  corpsState.corplist.data.forEach((corp) => {
    loaded = loaded || corp.key === corpId;
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

export function setFormValue(field, newValue) {
  return {
    type: actionTypes.SET_FORM_VALUE,
    data: { field, value: newValue }
  };
}

export function checkCorpDomain(subdomain, tenatId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CHECK_CORP_DOMAIN, actionTypes.CHECK_DOMAIN_SUCCEED, actionTypes.CHECK_DOMAIN_FAIL],
      endpoint: 'v1/user/corp/subdomain',
      method: 'get',
      params: {subdomain, tenatId}
    }
  };
}

export function loadCorps(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CORP_LOAD, actionTypes.CORP_LOAD_SUCCEED, actionTypes.CORP_LOAD_FAIL],
      endpoint: 'v1/account/corps',
      method: 'get',
      params,
      cookie
    }
  };
}
