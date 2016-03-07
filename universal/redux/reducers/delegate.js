import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC, setFormValueC } from '../../../reusable/domains/redux/form-common';
import { CORP_EDIT_SUCCEED } from './corps';
const actionTypes = createActionTypes('@@welogix/delegate/', [
  'SWITCH_TENANT',
  'MASTER_TENANTS_LOAD', 'MASTER_TENANTS_LOAD_SUCCEED', 'MASTER_TENANTS_LOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'delegate_SUBMIT', 'delegate_SUBMIT_SUCCEED', 'delegate_SUBMIT_FAIL',
  'delegate_DELETE', 'delegate_DELETE_SUCCEED', 'delegate_DELETE_FAIL',
  'delegate_EDIT', 'Delegate_EDIT_SUCCEED', 'delegate_EDIT_FAIL',
  'delegate_LOAD', 'delegate_LOAD_SUCCEED', 'delegate_LOAD_FAIL',
  'ID_LOAD_STATUS_SUCCEED', 'ID_LOAD_STATUS_FAIL', 'ID_LOAD_STATUS',
  'ID_LOAD_SELECTOPTIONS', 'ID_LOAD_SELECTOPTIONS_SUCCEED', 'ID_LOAD_SELECTOPTIONS_FAIL',
  'delegate_UnsentUnsent', 'delegate_UnsentUnsent_SUCCEED', 'delegate_UnsentUnsent_FAIL']);
appendFormAcitonTypes('@@welogix/delegate/', actionTypes);

const initialState = {
  loaded: false,
  loading: false,
  needUpdate: false,
  selectedIndex: -1,
  customs_code: [],
  tenant: {
    id: -1,
    parentId: -1
  },
  customs: {
    code: -1
  },
  formData: {},
  delegateist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  },
  customsBrokerList: [],
  selectOptions: {
    customsInfoList: [],
    declareWayList: [],
    tradeModeList: []
  },
  statusList: { // 初始化状态显示数量
    notSendCount: 0,
    notAcceptCount: 0,
    acceptCount: 0,
    invalidCount: 0
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
      case actionTypes.ID_LOAD_SELECTOPTIONS_SUCCEED:
      return {...state,
        selectOptions: {...state.selectOptions,
          customsInfoList: action.result.data.customsInfoList,
          declareWayList: action.result.data.declareWayList,
          tradeModeList: action.result.data.tradeModeList
        }
      };
      case actionTypes.ID_LOAD_STATUS:
      return {...state,
        statusList: initialState.statusList
      };
    case actionTypes.ID_LOAD_STATUS_SUCCEED:
      return {...state,
        statusList: {...state.statusList,
          invalidCount: action.result.data.invalidCount,
          notSendCount: action.result.data.notSendCount,
          notAcceptCount: action.result.data.notAcceptCount,
          acceptCount: action.result.data.acceptCount
        }
      };
    case actionTypes.ID_LOAD_STATUS_FAIL:
      return {...state,
        statusList: initialState.statusList
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
      const delegateist = {...state.delegateist
        };
        const statusList = {...state.statusList
        };
        if ((delegateist.current - 1) * delegateist.pageSize <= delegateist.totalCount // '=' because of totalCount 0
          && delegateist.current * delegateist.pageSize > delegateist.totalCount) {
          delegateist.data.push(action.result.data);
        }
        delegateist.totalCount++;
        statusList.notSendCount++;
        return {...state,
          delegateist,
          statusList
        };
    }
    // todo deal with submit fail submit loading
    default:
      return formReducer(actionTypes, state, action, {}, 'delegateist')
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

export function submit(delegate, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.delegate_SUBMIT, actionTypes.delegate_SUBMIT_SUCCEED, actionTypes.delegate_SUBMIT_FAIL],
      endpoint: 'v1/delegate/submit',
      method: 'post',
      data: { delegate, tenantId }
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

export function loadSelectOptions(cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_SELECTOPTIONS, actionTypes.ID_LOAD_SELECTOPTIONS_SUCCEED, actionTypes.ID_LOAD_SELECTOPTIONS_FAIL],
      endpoint: `v1/delegate/getSelectOptions`,
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
export function loadStatus(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_STATUS, actionTypes.ID_LOAD_STATUS_SUCCEED, actionTypes.ID_LOAD_STATUS_FAIL],
      endpoint: 'v1/delegate/StatusG',
      method: 'get',
      cookie,
      params
    }
  };
}
