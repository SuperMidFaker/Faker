import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC, setFormValueC } from '../../../reusable/domains/redux/form-common';
import { TENANT_ROLE } from '../../../universal/constants';
import { CORP_EDIT_SUCCEED, CORP_SUBMIT_SUCCEED, CORP_DELETE_SUCCEED, ORGAN_EDIT_SUCCEED } from './corps';

const actionTypes = createActionTypes('@@welogix/task/', [
  'SWITCH_TENANT',
  'MASTER_TENANTS_LOAD', 'MASTER_TENANTS_LOAD_SUCCEED', 'MASTER_TENANTS_LOAD_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'TASK_SUBMIT', 'TASK_SUBMIT_SUCCEED', 'TASK_SUBMIT_FAIL',
  'TASK_DELETE', 'TASK_DELETE_SUCCEED', 'TASK_DELETE_FAIL',
  'TASK_EDIT', 'TASK_EDIT_SUCCEED', 'TASK_EDIT_FAIL',
  'TASK_LOAD', 'TASK_LOAD_SUCCEED', 'TASK_LOAD_FAIL',
  'ID_LOAD_STATUS','ID_LOAD_STATUS_SUCCEED','ID_LOAD_STATUS_FAIL']);
appendFormAcitonTypes('@@welogix/task/', actionTypes);

export const TASK_EDIT_SUCCEED = actionTypes.TASK_EDIT_SUCCEED;
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
  tasklist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  },
  statusList: {//初始化状态显示数量
      notSendCount:0,
      notAcceptCount:0,
      acceptCount:0,
      invalidCount:0
  }
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CORP_EDIT_SUCCEED:
    case CORP_SUBMIT_SUCCEED:
    case CORP_DELETE_SUCCEED:
    case ORGAN_EDIT_SUCCEED:
      // 租户改变重新加载
      return { ...state, loaded: false };
    case actionTypes.TASK_LOAD:
      return {...state, loading: true, needUpdate: false};
    case actionTypes.TASK_LOAD_SUCCEED:
      return {...state, loaded: true, loading: false,
        tasklist: {...state.tasklist, ...action.result.data}
      };
    case actionTypes.TASK_LOAD_FAIL:
      return {...state, loading: false};
    case actionTypes.MASTER_TENANTS_LOAD_SUCCEED:
      return {...state, branches: action.result.data,
        tenant: action.result.data.length > 0 ? {
          id: action.result.data[0].key,
          parentId: action.result.data[0].parentId
        } : initialState.tenant
    };
    case actionTypes.SWITCH_TENANT:
      return {...state, tenant: action.tenant};
    case actionTypes.SWITCH_STATUS_SUCCEED: {
      const tasklist = { ...state.tasklist };
      tasklist.data[action.index].status = action.data.status;
      return {...state, tasklist};
    }
    case actionTypes.TASK_EDIT_SUCCEED: {
      const tasklist = {...state.tasklist};
      tasklist.data[state.selectedIndex] = action.data.task;
      return { ...state, tasklist, selectedIndex: -1 };
    }
    case actionTypes.TASK_DELETE_SUCCEED: {
      return { ...state, tasklist: {...state.tasklist, totalCount: state.tasklist.totalCount - 1}, needUpdate: true };
    }
    
    case actionTypes.ID_LOAD_STATUS:
    {return {...state, statusList: initialState.statusList};}
    
  case actionTypes.ID_LOAD_STATUS_SUCCEED:
     {return {...state, statusList: {...state.statusList, invalidCount:action.result.data.invalidCount, notSendCount: action.result.data.notSendCount,toMeCount: action.result.data.toMeCount,notAcceptCount: action.result.data.notAcceptCount, acceptCount: action.result.data.acceptCount}};
     }case actionTypes.ID_LOAD_STATUS_FAIL:
     {return { ...state, statusList: initialState.statusList };}
    
    
    case actionTypes.TASK_SUBMIT_SUCCEED: {
      const tasklist = {...state.tasklist};
      if ((tasklist.current - 1) * tasklist.pageSize <= tasklist.totalCount // = for 0 totalCount
          && tasklist.current * tasklist.pageSize > tasklist.totalCount) {
        tasklist.data.push({...action.data.task, key: action.result.data.pid,
                            loginId: action.result.data.loginId, status: action.result.data.status});
      }
      tasklist.totalCount++;
      return { ...state, tasklist };
    }
    // todo deal with submit fail submit loading
    default:
      return formReducer(actionTypes, state, action, {key: null, role: TENANT_ROLE.member.name}, 'tasklist')
            || state;
  }
}

export function loadStatus(cookie,params) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_LOAD_STATUS, actionTypes.ID_LOAD_STATUS_SUCCEED, actionTypes.ID_LOAD_STATUS_FAIL ],
      endpoint: 'v1/user/state',
      method: 'get',
      cookie,
      params
    }
  };
}

export function delTask(pid, loginId, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TASK_DELETE, actionTypes.TASK_DELETE_SUCCEED, actionTypes.TASK_DELETE_FAIL],
      endpoint: 'v1/user/task',
      method: 'del',
      data: { pid, loginId, tenant }
    }
  };
}

export function edit(task, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TASK_EDIT, actionTypes.TASK_EDIT_SUCCEED, actionTypes.TASK_EDIT_FAIL],
      endpoint: 'v1/user/task',
      method: 'put',
      data: { task, tenantId }
    }
  };
}

export function submit(task, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TASK_SUBMIT, actionTypes.TASK_SUBMIT_SUCCEED, actionTypes.TASK_SUBMIT_FAIL],
      endpoint: 'v1/user/task',
      method: 'post',
      data: { task, tenant }
    }
  };
}
export function isFormDataLoaded(taskState, persId) {
  return isFormDataLoadedC(persId, taskState, 'tasklist');
}

export function loadForm(cookie, persId) {
  return loadFormC(cookie, 'v1/user/task', {pid: persId}, actionTypes);
}

export function assignForm(taskState, persId) {
  return assignFormC(persId, taskState, 'tasklist', actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function setFormValue(field, newValue) {
  return setFormValueC(actionTypes, field, newValue);
}

export function loadTask(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TASK_LOAD, actionTypes.TASK_LOAD_SUCCEED, actionTypes.TASK_LOAD_FAIL],
      endpoint: 'v1/user/tasks',
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
      endpoint: 'v1/user/task/status',
      method: 'put',
      index,
      data: { status, pid }
    }
  };
}
