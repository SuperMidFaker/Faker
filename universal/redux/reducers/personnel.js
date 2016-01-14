import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import {appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC, setFormValueC} from '../../../reusable/domains/redux/form-common';
const actionTypes = createActionTypes('@@welogix/personnel/', [
  'SWITCH_TENANT', 'MODAL_SHOW', 'PERSONNEL_BEGIN_EDIT',
  'MASTER_TENANTS_LOAD', 'MASTER_TENANTS_LOAD_SUCCEED', 'MASTER_TENANTS_LOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'PERSONNEL_SUBMIT', 'PERSONNEL_SUBMIT_SUCCEED', 'PERSONNEL_SUBMIT_FAIL', 'PERSONNEL_DELETE',
  'PERSONNEL_DELETE_SUCCEED', 'PERSONNEL_DELETE_FAIL', 'PERSONNEL_EDIT', 'PERSONNEL_EDIT_SUCCEED',
  'PERSONNEL_EDIT_FAIL', 'PERSONNEL_LOAD', 'PERSONNEL_LOAD_SUCCEED', 'PERSONNEL_LOAD_FAIL']);
appendFormAcitonTypes('@@welogix/personnel/', actionTypes);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  branches: [],
  tenantId: '',
  formData: {},
  personnelist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  }
};
export default function reducer(state = initialState, action) {
  const plainPersonnel = initialState.thisPersonnel;
  switch (action.type) {
  case actionTypes.PERSONNEL_LOAD:
    return {...state, loading: true, needUpdate: false};
  case actionTypes.PERSONNEL_LOAD_SUCCEED:
    return {...state, loaded: true, loading: false, personnelist: {
      ...state.personnelist, ...action.result.data}
    };
  case actionTypes.PERSONNEL_LOAD_FAIL:
    return {...state, loading: false};
  case actionTypes.MASTER_TENANTS_LOAD_SUCCEED:
    return {...state, branches: action.result.data,
      tenantId: action.result.data.length > 0 ? `${action.result.data[0].key}` : ''};
  case actionTypes.SWITCH_TENANT:
    return {...state, tenantId: action.tenantId};
  case actionTypes.SWITCH_STATUS_SUCCEED: {
    const personnelist = {...state.personnelist};
    personnelist.data[action.index].status = action.data.status;
    return {...state, personnelist};
  }
  case actionTypes.PERSONNEL_EDIT_SUCCEED: {
    const personnel = {...state.personnel};
    personnel.data[action.index] = state.thisPersonnel;
    return { ...state, personnel, thisPersonnel: plainPersonnel, visible: false };
  }
  case actionTypes.PERSONNEL_DELETE_SUCCEED: {
    return { ...state, needUpdate: true };
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
    return formReducer(actionTypes, state, initialState, action, 'personnelist');
  }
}

export function delPersonnel(pid, accountId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_DELETE, actionTypes.PERSONNEL_DELETE_SUCCEED, actionTypes.PERSONNEL_DELETE_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'del',
      data: { pid, accountId }
    }
  };
}

export function editPersonnel(personnel, index) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_EDIT, actionTypes.PERSONNEL_EDIT_SUCCEED, actionTypes.PERSONNEL_EDIT_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'put',
      index,
      data: { personnel }
    }
  };
}

export function submitPersonnel(personnel) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_SUBMIT, actionTypes.PERSONNEL_SUBMIT_SUCCEED, actionTypes.PERSONNEL_SUBMIT_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'post',
      data: { personnel }
    }
  };
}
export function isFormDataLoaded(personnelState, persId) {
  return isFormDataLoadedC(persId, personnelState, 'personnelist');
}

export function loadForm(cookie, persId) {
  return loadFormC(cookie, 'v1/user/personnel', {pid: persId}, actionTypes);
}

export function assignForm(personnelState, persId) {
  return assignFormC(persId, personnelState, 'personnelist', actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}

export function loadPersonnel(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_LOAD, actionTypes.PERSONNEL_LOAD_SUCCEED, actionTypes.PERSONNEL_LOAD_FAIL],
      endpoint: 'v1/user/personnels',
      method: 'get',
      params,
      cookie
    }
  };
}

export function loadTenantsByMaster(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.MASTER_TENANTS_LOAD, actionTypes.MASTER_TENANTS_LOAD_SUCCEED, actionTypes.MASTER_TENANTS_LOAD_FAIL],
      endpoint: `v1/user/${tenantId}/tenants`,
      method: 'get',
      cookie
    }
  };
}

export function switchTenant(tenantId) {
  return {
    type: actionTypes.SWITCH_TENANT,
    tenantId
  };
}

export function switchStatus(index, pid, status) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_STATUS, actionTypes.SWITCH_STATUS_SUCCEED, actionTypes.SWITCH_STATUS_FAIL],
      endpoint: 'v1/user/personnel/status',
      method: 'put',
      index,
      data: {status, pid}
    }
  };
}
