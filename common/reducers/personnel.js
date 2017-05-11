import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC } from './form-common';

const actionTypes = createActionTypes('@@welogix/personnel/', [
  'LOAD_DEPARTMENTS', 'LOAD_DEPARTMENTS_SUCCEED', 'LOAD_DEPARTMENTS_FAIL',
  'CREATE_DEPT', 'CREATE_DEPT_SUCCEED', 'CREATE_DEPT_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'PERSONNEL_SUBMIT', 'PERSONNEL_SUBMIT_SUCCEED', 'PERSONNEL_SUBMIT_FAIL',
  'PERSONNEL_DELETE', 'PERSONNEL_DELETE_SUCCEED', 'PERSONNEL_DELETE_FAIL',
  'PERSONNEL_EDIT', 'PERSONNEL_EDIT_SUCCEED', 'PERSONNEL_EDIT_FAIL',
  'LOAD_MEMBERS', 'LOAD_MEMBERS_SUCCEED', 'LOAD_MEMBERS_FAIL',
  'LOAD_ROLES', 'LOAD_ROLES_SUCCEED', 'LOAD_ROLES_FAIL',
]);
appendFormAcitonTypes('@@welogix/personnel/', actionTypes);

export const PERSONNEL_EDIT_SUCCEED = actionTypes.PERSONNEL_EDIT_SUCCEED;
const initialState = {
  loading: false,
  submitting: false,
  selectedIndex: -1,
  departments: [],
  tenant: {
    id: -1,
    parentId: -1,
  },
  formData: {
    key: -1,
  },
  memberlist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  memberFilters: {
    dept_id: undefined,
  },
  visibleMemberModal: false,
  departmentMembers: [],
  roles: [],
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_MEMBERS:
      return { ...state, loading: true, memberFilters: JSON.parse(action.params.filters) };
    case actionTypes.LOAD_MEMBERS_SUCCEED:
      return { ...state, loading: false, memberlist: action.result.data };
    case actionTypes.LOAD_MEMBERS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_DEPARTMENTS_SUCCEED:
      return { ...state, departments: action.result.data };
    case actionTypes.SWITCH_STATUS_SUCCEED: {
      const personnelist = { ...state.personnelist };
      personnelist.data[action.index].status = action.data.status;
      return { ...state, personnelist };
    }
    case actionTypes.PERSONNEL_SUBMIT:
    case actionTypes.PERSONNEL_EDIT:
      return { ...state, submitting: true };
    case actionTypes.PERSONNEL_SUBMIT_FAIL:
    case actionTypes.PERSONNEL_EDIT_FAIL:
      return { ...state, submitting: false };
    case actionTypes.PERSONNEL_EDIT_SUCCEED: {
      const personnelist = { ...state.personnelist };
      personnelist.data[state.selectedIndex] = action.data.personnel;
      return { ...state, personnelist, selectedIndex: -1, submitting: false };
    }
    case actionTypes.PERSONNEL_SUBMIT_SUCCEED: {
      const personnelist = { ...state.personnelist };
      if (personnelist.current * personnelist.pageSize > personnelist.totalCount) {
        personnelist.data.push({
          ...action.data.personnel, key: action.result.data.pid,
          loginId: action.result.data.loginId, status: action.result.data.status,
        });
      }
      personnelist.totalCount++;
      return { ...state, personnelist, submitting: false };
    }
    case actionTypes.LOAD_ROLES_SUCCEED:
      return { ...state, roles: action.result.data };
    default:
      return formReducer(actionTypes, state, action, { key: null },
                         'personnelist') || state;
  }
}

export function loadMembers(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_MEMBERS, actionTypes.LOAD_MEMBERS_SUCCEED, actionTypes.LOAD_MEMBERS_FAIL],
      endpoint: 'v1/personnel/members',
      method: 'get',
      params,
    },
  };
}

export function loadDepartments(tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_DEPARTMENTS, actionTypes.LOAD_DEPARTMENTS_SUCCEED, actionTypes.LOAD_DEPARTMENTS_FAIL],
      endpoint: 'v1/personnel/departments',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function createDepartment(tenantId, name) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CREATE_DEPT, actionTypes.CREATE_DEPT_SUCCEED, actionTypes.CREATE_DEPT_FAIL],
      endpoint: 'v1/personnel/new/department',
      method: 'post',
      data: { name, tenantId },
    },
  };
}

export function delPersonnel(pid, loginId, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_DELETE, actionTypes.PERSONNEL_DELETE_SUCCEED, actionTypes.PERSONNEL_DELETE_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'del',
      data: { pid, loginId, tenant },
    },
  };
}

export function edit(personnel, code, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_EDIT, actionTypes.PERSONNEL_EDIT_SUCCEED, actionTypes.PERSONNEL_EDIT_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'put',
      data: { personnel, code, tenantId },
    },
  };
}

export function submit(personnel, code, tenant) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PERSONNEL_SUBMIT, actionTypes.PERSONNEL_SUBMIT_SUCCEED, actionTypes.PERSONNEL_SUBMIT_FAIL],
      endpoint: 'v1/user/personnel',
      method: 'post',
      data: { personnel, code, tenant },
    },
  };
}
export function isFormDataLoaded(personnelState, persId) {
  return isFormDataLoadedC(persId, personnelState, 'personnelist');
}

export function loadForm(cookie, persId) {
  return loadFormC(cookie, 'v1/user/personnel', { pid: persId }, actionTypes);
}

export function assignForm(personnelState, persId) {
  return assignFormC(persId, personnelState, 'personnelist', actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function switchStatus(index, pid, status) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_STATUS, actionTypes.SWITCH_STATUS_SUCCEED, actionTypes.SWITCH_STATUS_FAIL],
      endpoint: 'v1/user/personnel/status',
      method: 'put',
      index,
      data: { status, pid },
    },
  };
}

export function loadRoles(tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_ROLES, actionTypes.LOAD_ROLES_SUCCEED, actionTypes.LOAD_ROLES_FAIL],
      endpoint: 'v1/user/roles',
      method: 'get',
      params: { tenantId },
    },
  };
}
