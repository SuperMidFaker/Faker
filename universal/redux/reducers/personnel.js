import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import {appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC, setFormValueC} from '../../../reusable/domains/redux/form-common';
import {TENANT_ROLE} from '../../../universal/constants';
const actionTypes = createActionTypes('@@welogix/personnel/', [
  'SWITCH_TENANT',
  'MASTER_TENANTS_LOAD', 'MASTER_TENANTS_LOAD_SUCCEED', 'MASTER_TENANTS_LOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'PERSONNEL_SUBMIT', 'PERSONNEL_SUBMIT_SUCCEED', 'PERSONNEL_SUBMIT_FAIL',
  'PERSONNEL_DELETE', 'PERSONNEL_DELETE_SUCCEED', 'PERSONNEL_DELETE_FAIL',
  'PERSONNEL_EDIT', 'PERSONNEL_EDIT_SUCCEED', 'PERSONNEL_EDIT_FAIL',
  'PERSONNEL_LOAD', 'PERSONNEL_LOAD_SUCCEED', 'PERSONNEL_LOAD_FAIL']);
appendFormAcitonTypes('@@welogix/personnel/', actionTypes);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  selectedIndex: -1,
  branches: [],
  tenant: {
    id: -1,
    parentId: -1
  },
  formData: {
    key: -1
  },
  personnelist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  }
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
  case actionTypes.PERSONNEL_LOAD:
    return {...state, loading: true, needUpdate: false};
  case actionTypes.PERSONNEL_LOAD_SUCCEED:
    return {...state, loaded: true, loading: false,
      personnelist: {...state.personnelist, ...action.result.data}
    };
  case actionTypes.PERSONNEL_LOAD_FAIL:
    return {...state, loading: false};
  case actionTypes.MASTER_TENANTS_LOAD_SUCCEED:
    return {...state, branches: action.result.data,
      tenant: action.result.data.length > 0 ? {
        id: action.result.data[0].key,
        parentId: action.result.data[0].parentId
      } : {}};
  case actionTypes.SWITCH_TENANT:
    return {...state, tenant: action.tenant};
  case actionTypes.SWITCH_STATUS_SUCCEED: {
    const personnelist = {...state.personnelist};
    personnelist.data[action.index].status = action.data.status;
    return {...state, personnelist};
  }
  case actionTypes.PERSONNEL_EDIT_SUCCEED: {
    const personnelist = {...state.personnelist};
    personnelist.data[state.selectedIndex] = action.data.personnel;
    return { ...state, personnelist};
  }
  case actionTypes.PERSONNEL_DELETE_SUCCEED: {
    return { ...state, personnelist: {...state.personnelist, totalCount: state.personnelist.totalCount - 1}, needUpdate: true };
  }
  case actionTypes.PERSONNEL_SUBMIT_SUCCEED: {
    const personnelist = {...state.personnelist};
    if ((personnelist.current - 1) * personnelist.pageSize <= personnelist.totalCount // = for 0 totalCount
        && personnelist.current * personnelist.pageSize > personnelist.totalCount) {
      personnelist.data.push({...action.data.personnel, key: action.result.data.pid,
                          loginId: action.result.data.loginId, status: action.result.data.status});
    }
    personnelist.totalCount++;
    return { ...state, personnelist };
  }
  // todo deal with submit fail submit loading
  default:
    return formReducer(actionTypes, state, action, {key: null, role: TENANT_ROLE.member.name}, 'personnelist')
          || state;
  }
}

export function delPersonnel(pid, loginId, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_DELETE, actionTypes.PERSONNEL_DELETE_SUCCEED, actionTypes.PERSONNEL_DELETE_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'del',
      data: {pid, loginId, tenant}
    }
  };
}

export function edit(personnel) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_EDIT, actionTypes.PERSONNEL_EDIT_SUCCEED, actionTypes.PERSONNEL_EDIT_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'put',
      data: { personnel }
    }
  };
}

export function submit(personnel, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_SUBMIT, actionTypes.PERSONNEL_SUBMIT_SUCCEED, actionTypes.PERSONNEL_SUBMIT_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'post',
      data: {personnel, tenant}
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

export function switchTenant(tenant) {
  return {
    type: actionTypes.SWITCH_TENANT,
    tenant
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
