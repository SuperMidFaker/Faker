import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { appendFormAcitonTypes, formReducer, isFormDataLoadedC, loadFormC, assignFormC,
  clearFormC } from './form-common';

const actionTypes = createActionTypes('@@welogix/personnel/', [
  'LOAD_DEPARTMENTS', 'LOAD_DEPARTMENTS_SUCCEED', 'LOAD_DEPARTMENTS_FAIL',
  'CREATE_DEPT', 'CREATE_DEPT_SUCCEED', 'CREATE_DEPT_FAIL',
  'SWITCH_STATUS', 'SWITCH_STATUS_SUCCEED', 'SWITCH_STATUS_FAIL',
  'SUBMIT_MEMBER', 'SUBMIT_MEMBER_SUCCEED', 'SUBMIT_MEMBER_FAIL',
  'DEL_MEMBER', 'DEL_MEMBER_SUCCEED', 'DEL_MEMBER_FAIL',
  'EDIT_MEMBER', 'EDIT_MEMBER_SUCCEED', 'EDIT_MEMBER_FAIL',
  'LOAD_MEMBERS', 'LOAD_MEMBERS_SUCCEED', 'LOAD_MEMBERS_FAIL',
  'LOAD_ROLES', 'LOAD_ROLES_SUCCEED', 'LOAD_ROLES_FAIL',
  'SAVE_DEPM', 'SAVE_DEPM_SUCCEED', 'SAVE_DEPM_FAIL',
  'LOAD_NONDEPTM', 'LOAD_NONDEPTM_SUCCEED', 'LOAD_NONDEPTM_FAIL',
  'OPEN_AMM', 'CLOSE_AMM',
  'LOAD_DEPARTMENT_MEMBERS', 'LOAD_DEPARTMENT_MEMBERS_SUCCEED', 'LOAD_DEPARTMENT_MEMBERS_FAIL',
]);
appendFormAcitonTypes('@@welogix/personnel/', actionTypes);

const initialState = {
  loading: false,
  submitting: false,
  selectedIndex: -1,
  departments: [],
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
      const memberlist = { ...state.memberlist };
      memberlist.data[action.index].status = action.data.status;
      return { ...state, memberlist };
    }
    case actionTypes.SUBMIT_MEMBER:
    case actionTypes.EDIT_MEMBER:
      return { ...state, submitting: true };
    case actionTypes.SUBMIT_MEMBER_FAIL:
    case actionTypes.EDIT_MEMBER_FAIL:
    case actionTypes.EDIT_MEMBER_SUCCEED:
    case actionTypes.SUBMIT_MEMBER_SUCCEED:
      return { ...state, submitting: false };
    case actionTypes.OPEN_AMM:
      return { ...state, visibleMemberModal: true };
    case actionTypes.CLOSE_AMM:
      return { ...state, visibleMemberModal: false };
    case actionTypes.LOAD_ROLES_SUCCEED:
      return { ...state, roles: action.result.data };
    default:
      return formReducer(
        actionTypes, state, action, { key: null },
        'memberlist'
      ) || state;
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

export function loadDepartmentMembers(departmentId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_DEPARTMENT_MEMBERS, actionTypes.LOAD_DEPARTMENT_MEMBERS_SUCCEED, actionTypes.LOAD_DEPARTMENT_MEMBERS_FAIL],
      endpoint: 'v1/personnel/department/members',
      method: 'get',
      params: { departmentId },
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

export function delMember(pid, loginId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.DEL_MEMBER, actionTypes.DEL_MEMBER_SUCCEED, actionTypes.DEL_MEMBER_FAIL],
      endpoint: 'v1/personnel/del/member',
      method: 'del',
      data: { pid, loginId, tenantId },
    },
  };
}

export function edit(personnel, code, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.EDIT_MEMBER, actionTypes.EDIT_MEMBER_SUCCEED, actionTypes.EDIT_MEMBER_FAIL],
      endpoint: 'v1/personnel/edit/member',
      method: 'put',
      data: { personnel, code, tenantId },
    },
  };
}

export function submit(personnel, code, tenantId, parentTenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SUBMIT_MEMBER, actionTypes.SUBMIT_MEMBER_SUCCEED, actionTypes.SUBMIT_MEMBER_FAIL],
      endpoint: 'v1/personnel/new/member',
      method: 'post',
      data: {
        personnel, code, tenantId, parentTenantId,
      },
    },
  };
}
export function isFormDataLoaded(personnelState, persId) {
  return isFormDataLoadedC(persId, personnelState, 'memberlist');
}

export function loadForm(cookie, persId) {
  return loadFormC(cookie, 'v1/personnel/member', { pid: persId }, actionTypes);
}

export function assignForm(personnelState, persId) {
  return assignFormC(persId, personnelState, 'memberlist', actionTypes);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function switchStatus(index, pid, status) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SWITCH_STATUS, actionTypes.SWITCH_STATUS_SUCCEED, actionTypes.SWITCH_STATUS_FAIL],
      endpoint: 'v1/personnel/member/status',
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

export function openMemberModal() {
  return { type: actionTypes.OPEN_AMM };
}

export function closeMemberModal() {
  return { type: actionTypes.CLOSE_AMM };
}

export function loadNonDepartmentMembers(deptId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_NONDEPTM, actionTypes.LOAD_NONDEPTM_SUCCEED, actionTypes.LOAD_NONDEPTM_FAIL],
      endpoint: 'v1/personnel/nondepartment/members',
      method: 'get',
      params: { deptId, tenantId },
    },
  };
}

export function saveDepartMember(deptId, userId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SAVE_DEPM, actionTypes.SAVE_DEPM_SUCCEED, actionTypes.SAVE_DEPM_FAIL],
      endpoint: 'v1/personnel/add/department/member',
      method: 'post',
      data: { deptId, userId },
    },
  };
}
