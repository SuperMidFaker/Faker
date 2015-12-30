import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
const actionTypes = createActionTypes('@@welogix/personnel/', [
  'MODAL_HIDE', 'MODAL_SHOW', 'PERSONNEL_BEGIN_EDIT', 'CHANGE_PERSONNEL_VALUE',
  'PERSONNEL_SUBMIT', 'PERSONNEL_SUBMIT_SUCCEED', 'PERSONNEL_SUBMIT_FAIL', 'PERSONNEL_DELETE',
  'PERSONNEL_DELETE_SUCCEED', 'PERSONNEL_DELETE_FAIL', 'PERSONNEL_EDIT', 'PERSONNEL_EDIT_SUCCEED',
  'PERSONNEL_EDIT_FAIL', 'PERSONNEL_LOAD', 'PERSONNEL_LOAD_SUCCEED', 'PERSONNEL_LOAD_FAIL']);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  visible: false,
  thisPersonnel: {
  },
  personnel: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  }
};
export default function reducer(state = initialState, action) {
  const plainPersonnel = initialState.thisPersonnel;
  switch (action.type) {
  case actionTypes.MODAL_HIDE:
    return { ...state, visible: false };
  case actionTypes.MODAL_SHOW:
    return { ...state, thisPersonnel: plainPersonnel, visible: true };
  case actionTypes.PERSONNEL_LOAD:
    return {...state, loading: true, needUpdate: false};
  case actionTypes.PERSONNEL_LOAD_SUCCEED:
    return {...state, loaded: true, loading: false, personnel: {...state.personnel, ...action.result.data}};
  case actionTypes.PERSONNEL_LOAD_FAIL:
    return {...state, loading: false};
  case actionTypes.PERSONNEL_BEGIN_EDIT:
    return { ...state, thisPersonnel: { ...state.personnel.data[action.data.index] }, visible: true, selectIndex: action.data.index };
  case actionTypes.PERSONNEL_EDIT_SUCCEED: {
    const personnel = {...state.personnel};
    personnel.data[action.index] = state.thisPersonnel;
    return { ...state, personnel, thisPersonnel: plainPersonnel, visible: false };
  }
  case actionTypes.PERSONNEL_DELETE_SUCCEED: {
    return { ...state, needUpdate: true };
  }
  case actionTypes.CHANGE_PERSONNEL_VALUE: {
    const thisPersonnel = { ...state.thisPersonnel };
    thisPersonnel[action.data.field] = action.data.value;
    return { ...state, thisPersonnel };
  }
  case actionTypes.PERSONNEL_SUBMIT_SUCCEED: {
    const personnel = {...state.personnel};
    if ((personnel.current - 1) * personnel.pageSize <= personnel.totalCount // = for 0 totalCount
        && personnel.current * personnel.pageSize > personnel.totalCount) {
      personnel.data.push({...action.data.personnel, key: action.result.data.pid,
                          accountId: action.result.data.accountId});
    }
    personnel.totalCount++;
    return { ...state, personnel, thisPersonnel: plainPersonnel, visible: false };
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

export function beginEditPersonnel(index) {
  return {
    type: actionTypes.PERSONNEL_BEGIN_EDIT,
    data: { index }
  };
}

export function delPersonnel(pid, accountId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_DELETE, actionTypes.PERSONNEL_DELETE_SUCCEED, actionTypes.PERSONNEL_DELETE_FAIL],
      endpoint: 'v1/account/personnel',
      method: 'del',
      data: { pid, accountId }
    }
  };
}

export function editPersonnel(personnel, index) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_EDIT, actionTypes.PERSONNEL_EDIT_SUCCEED, actionTypes.PERSONNEL_EDIT_FAIL],
      endpoint: 'v1/account/personnel',
      method: 'put',
      index,
      data: { personnel }
    }
  };
}

export function changeThisPersonnel(field, newValue) {
  return {
    type: actionTypes.CHANGE_PERSONNEL_VALUE,
    data: { field, value: newValue }
  };
}

export function submitPersonnel(personnel) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_SUBMIT, actionTypes.PERSONNEL_SUBMIT_SUCCEED, actionTypes.PERSONNEL_SUBMIT_FAIL],
      endpoint: 'v1/account/personnel',
      method: 'post',
      data: { personnel }
    }
  };
}

export function loadPersonnels(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_LOAD, actionTypes.PERSONNEL_LOAD_SUCCEED, actionTypes.PERSONNEL_LOAD_FAIL],
      endpoint: 'v1/account/personnels/',
      method: 'get',
      params,
      cookie
    }
  };
}
