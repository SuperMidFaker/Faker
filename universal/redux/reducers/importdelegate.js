import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  needUpdate: false,
  formData: {},
  editIndex: -1,
  idlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: []
  }
};

const actions = [
  'ID_LOAD', 'ID_LOAD_SUCCEED', 'ID_LOAD_FAIL', 'ID_SUBMIT', 'ID_SUBMIT_SUCCEED', 'ID_SUBMIT_FAIL', 'ID_BEGIN_EDIT', 'ID_EDIT',
  'ID_UPDATE', 'ID_UPDATE_SUCCEED', 'ID_UPDATE_FAIL', 'ID_DELETE', 'ID_DELETE_SUCCEED', 'ID_DELETE_FAIL', 'ID_EDIT_CANCEL'
];
const domain = '@@qm-import/importdelegate/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case actionTypes.ID_LOAD:
    return { ...state, loading: true, needUpdate: false };
  case actionTypes.ID_LOAD_SUCCEED:
    return { ...state, loaded: true, loading: false, idlist: action.result.data };
  case actionTypes.ID_LOAD_FAIL:
    return { ...state, loaded: true, loading: false, idlist: initialState.idlist };
  case actionTypes.ID_SUBMIT_SUCCEED: {
    let idDataArray;
    if (state.idlist.totalCount === 0 || (((state.idlist.totalCount / state.idlist.pageSize) >> 0) + 1
                                          === state.idlist.current)) {
      // 数据为空或当前页未满,更新新增的数据到state
      idDataArray = [...state.idlist.data];
      idDataArray.push({ ...action.data.importdelegate, key: action.result.data.id });
    }
    return { ...state, idlist: { ...state.idlist, totalCount: state.idlist.totalCount + 1,
      data: idDataArray || state.idlist.data }, formData: {}, editIndex: -1 };
  }
  case actionTypes.ID_UPDATE_SUCCEED: {
    const idDataArray = [...state.idlist.data];
    idDataArray[state.editIndex] = action.data.importdelegate;
    return { ...state, idlist: { ...state.idlist, data: idDataArray }, formData: {}, editIndex: -1 };
  }
  case actionTypes.ID_DELETE_SUCCEED:
    return { ...state, needUpdate: true, idlist: { ...state.idlist, totalCount: state.idlist.totalCount - 1 } };
  case actionTypes.ID_BEGIN_EDIT:
    return {...state, formData: action.data.item, editIndex: action.data.index};
  case actionTypes.ID_EDIT:
    return {...state, formData: {...state.formData, [action.data.name]: action.data.value}};
  case actionTypes.ID_EDIT_CANCEL:
    return {...state, formData: {}, editIndex: -1};
  default:
    return state;
  }
}

export function loadDelegates(params, cookie) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_LOAD, actionTypes.ID_LOAD_SUCCEED, actionTypes.ID_LOAD_FAIL ],
      endpoint: 'v1/import/importdelegates',
      method: 'get',
      params,
      cookie
    }
  };
}

export function submitDelegate(importdelegate, corpId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_SUBMIT, actionTypes.ID_SUBMIT_SUCCEED, actionTypes.ID_SUBMIT_FAIL ],
      endpoint: 'v1/import/importdelegate',
      method: 'post',
      data: { importdelegate, corpId, tenantId }
    }
  };
}

export function updateId(importdelegate) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_UPDATE, actionTypes.ID_UPDATE_SUCCEED, actionTypes.ID_UPDATE_FAIL ],
      endpoint: 'v1/import/importdelegate',
      method: 'put',
      data: { importdelegate }
    }
  };
}

export function delId(idkey) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_DELETE, actionTypes.ID_DELETE_SUCCEED, actionTypes.ID_DELETE_FAIL ],
      endpoint: 'v1/import/importdelegate',
      method: 'del',
      data: { idkey }
    }
  };
}

export function beginEdit(item, index) {
  return {
    type: actionTypes.ID_BEGIN_EDIT,
    data: {item, index}
  };
}

export function edit(name, value) {
  return {
    type: actionTypes.ID_EDIT,
    data: {name, value}
  };
}

export function cancelEdit() {
  return {
    type: actionTypes.ID_EDIT_CANCEL
  };
}
