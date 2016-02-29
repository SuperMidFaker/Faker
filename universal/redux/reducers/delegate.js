import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC, setFormValueC } from '../../../reusable/domains/redux/form-common';
import { TENANT_ROLE } from '../../../universal/constants';
import { CORP_EDIT_SUCCEED } from './corps';
const actionTypes = createActionTypes('@@welogix/delegate/', [
  'SWITCH_TENANT',
  'MASTER_TENANTS_LOAD', 'MASTER_TENANTS_LOAD_SUCCEED', 'MASTER_TENANTS_LOAD_FAIL',
  'MASTER_Master_Customs_LOAD', 'MASTER_Master_Customs_LOAD_SUCCEED', 'MASTER_Master_Customs_LOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'delegate_SUBMIT', 'delegate_SUBMIT_SUCCEED', 'delegate_SUBMIT_FAIL',
  'delegate_DELETE', 'delegate_DELETE_SUCCEED', 'delegate_DELETE_FAIL',
  'delegate_EDIT', 'Delegate_EDIT_SUCCEED', 'delegate_EDIT_FAIL',
  'delegate_LOAD', 'delegate_LOAD_SUCCEED', 'delegate_LOAD_FAIL',
  'delegate_UnsentUnsent', 'delegate_UnsentUnsent_SUCCEED', 'delegate_UnsentUnsent_FAIL']);
appendFormAcitonTypes('@@welogix/delegate/', actionTypes);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  selectedIndex: -1,
  customs_code: [],
  customs: {
    code: -1
  },
  formData: {
    key: -1
  },
  delegateist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  }
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CORP_EDIT_SUCCEED:
      // 租户变化时重新加载
      return { ...state, loaded: false };
    case actionTypes.delegate_LOAD:
      return {...state, loading: true, needUpdate: false};
    case actionTypes.delegate_LOAD_SUCCEED:
      return {...state, loaded: true, loading: false,
        delegateist: {...state.delegateist, ...action.result.data}
      };
    case actionTypes.delegate_LOAD_FAIL:
      return {...state, loading: false};
    case actionTypes.delegate_UnsentUnsent:
      return {...state, loading: true, needUpdate: false};
    case actionTypes.delegate_UnsentUnsent_SUCCEED:
      return {...state, loaded: true, loading: false,
        delegateist: {...state.delegateist, ...action.result.data}
      };
    case actionTypes.delegate_UnsentUnsent_FAIL:
      return {...state, loading: false};
    case actionTypes.MASTER_TENANTS_LOAD_SUCCEED:
      return {...state, branches: action.result.data,
        tenant: action.result.data.length > 0 ? {
          id: action.result.data[0].key,
          parentId: action.result.data[0].parentId
        } : {}};
     case actionTypes.MASTER_Master_Customs_LOAD_SUCCEED:
      return {...state, customs_code: action.result.data,
        tenant: action.result.data.length > 0 ? {
          id: action.result.data[0].key,
          parentId: action.result.data[0].parentId
        } : {}};
    case actionTypes.SWITCH_TENANT:
      return {...state, tenant: action.tenant};
    case actionTypes.Customs_CodeS:
      return {...state, customs_code: action.customs_code};
    case actionTypes.SWITCH_STATUS_SUCCEED: {
      const delegateist = {...state.delegateist};
      delegateist.data[action.index].status = action.data.status;
      return {...state, delegateist};
    }
    case actionTypes.Delegate_EDIT_SUCCEED: {
      const delegateist = {...state.delegateist};
      delegateist.data[state.selectedIndex] = action.data.delegate;
      return { ...state, delegateist, selectedIndex: -1 };
    }
    case actionTypes.delegate_DELETE_SUCCEED: {
      return { ...state, delegateist: {...state.delegateist, totalCount: state.delegateist.totalCount - 1}, needUpdate: true };
    }
    case actionTypes.delegate_SUBMIT_SUCCEED: {
      const delegateist = {...state.delegateist};
      if ((delegateist.current - 1) * delegateist.pageSize <= delegateist.totalCount // = for 0 totalCount
          && delegateist.current * delegateist.pageSize > delegateist.totalCount) {
        delegateist.data.push({...action.data.delegate, key: action.result.data.pid,
                            loginId: action.result.data.loginId, status: action.result.data.status});
      }
      delegateist.totalCount++;
      return { ...state, delegateist };
    }
    // todo deal with submit fail submit loading
    default:
      return formReducer(actionTypes, state, action, {key: null, role: TENANT_ROLE.member.name}, 'delegateist')
            || state;
  }
}

export function deldelegate(pid, loginId, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_DELETE, actionTypes.delegate_DELETE_SUCCEED, actionTypes.delegate_DELETE_FAIL],
      endpoint: 'v1/delegate/delete',
      method: 'del',
      data: { pid, loginId, tenant }
    }
  };
}

export function edit(delegate, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_EDIT, actionTypes.Delegate_EDIT_SUCCEED, actionTypes.delegate_EDIT_FAIL],
      endpoint: 'v1/delegate/edit',
      method: 'put',
      data: { delegate, tenantId }
    }
  };
}

export function submit(delegate, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_SUBMIT, actionTypes.delegate_SUBMIT_SUCCEED, actionTypes.delegate_SUBMIT_FAIL],
      endpoint: 'v1/delegate/submit',
      method: 'post',
      data: { delegate, tenant }
    }
  };
}
export function isFormDataLoaded(delegateState, persId) {
  return isFormDataLoadedC(persId, delegateState, 'delegateist');
}

export function loadForm(cookie, persId) {
  return loadFormC(cookie, 'v1/delegate/delegate', {pid: persId}, actionTypes);
}

export function assignForm(delegateState, persId) {
  return assignFormC(persId, delegateState, 'delegateist', actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}

export function loaddelegate(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_LOAD, actionTypes.delegate_LOAD_SUCCEED, actionTypes.delegate_LOAD_FAIL],
      endpoint: 'v1/delegate/delegate',
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
      endpoint: `v1/delegate/${tenantId}/tenants`,
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
      endpoint: 'v1/delegate/status',
      method: 'put',
      index,
      data: { status, pid }
    }
  };
}
  export function UnsentUnsent(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_UnsentUnsent, actionTypes.delegate_UnsentUnsent_SUCCEED, actionTypes.delegate_UnsentUnsent_FAIL],
      endpoint: 'v1/delegate/UnsentUnsent',
      method: 'put',
      params,
      cookie
    }
  };
}
