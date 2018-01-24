import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { INTRINSIC_MODULE_FEATURES } from 'common/constants';

const initialState = {
  loaded: false,
  loading: false,
  submitting: false,
  list: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  modules: [],
  formData: {
    privileges: {},
  },
  roleModal: {
    visible: false,
  },
};

const actions = [
  'LOAD_ROLES', 'LOAD_ROLES_SUCCEED', 'LOAD_ROLES_FAIL',
  'LOAD_ROLE', 'LOAD_ROLE_SUCCEED', 'LOAD_ROLE_FAIL',
  'EDIT_ROLE', 'EDIT_ROLE_SUCCEED', 'EDIT_ROLE_FAIL',
  'SUBMIT_ROLE', 'SUBMIT_ROLE_SUCCEED', 'SUBMIT_ROLE_FAIL',
  'LOAD_MODULES', 'LOAD_MODULES_SUCCEED', 'LOAD_MODULES_FAIL',
  'SWITCH_ENABLE', 'SWITCH_ENABLE_SUCCEED', 'SWITCH_ENABLE_FAIL',
  'CLEAR_FORM', 'TOGGLE_ROLE_MODAL',
];
const domain = '@@welogix/role/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ROLES:
      return { ...state, loading: true };
    case actionTypes.LOAD_ROLES_FAIL:
      return { ...state, loading: false, loaded: true };
    case actionTypes.LOAD_ROLES_SUCCEED:
      return {
        ...state, loaded: true, loading: false, list: action.result.data,
      };
    case actionTypes.CLEAR_FORM:
      return { ...state, formData: initialState.formData };
    case actionTypes.LOAD_ROLE_SUCCEED:
      return { ...state, formData: action.result.data };
    case actionTypes.LOAD_MODULES_SUCCEED:
      return {
        ...state,
        modules: INTRINSIC_MODULE_FEATURES.filter(imf => action.result.data.indexOf(imf.id) >= 0),
      };
    case actionTypes.EDIT_ROLE:
    case actionTypes.SUBMIT_ROLE:
      return { ...state, submitting: true };
    case actionTypes.SUBMIT_ROLE_SUCCEED:
    case actionTypes.EDIT_ROLE_SUCCEED:
      return { ...state, loaded: false, submitting: false };
    case actionTypes.SWITCH_ENABLE_SUCCEED: {
      const { extra } = action;
      const listData = [...state.list.data];
      listData[extra.index].status = extra.enabled ? 1 : 0;
      return { ...state, list: { ...state.list, data: listData } };
    }
    case actionTypes.TOGGLE_ROLE_MODAL:
      return { ...state, roleModal: { ...state.roleModal, visible: action.visible } };
    default:
      return state;
  }
}

export function loadRoles(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_ROLES, actionTypes.LOAD_ROLES_SUCCEED, actionTypes.LOAD_ROLES_FAIL],
      endpoint: 'v1/tenant/paged/roles',
      method: 'get',
      params,
    },
  };
}

export function clearForm() {
  return {
    type: actionTypes.CLEAR_FORM,
  };
}

export function loadRole(roleId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_ROLE, actionTypes.LOAD_ROLE_SUCCEED, actionTypes.LOAD_ROLE_FAIL],
      endpoint: 'v1/tenant/roleprivilege',
      method: 'get',
      params: { roleId },
    },
  };
}

export function loadTenantModules(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MODULES, actionTypes.LOAD_MODULES_SUCCEED,
        actionTypes.LOAD_MODULES_FAIL,
      ],
      endpoint: 'v1/tenant/modules',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function updateRole(form) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_ROLE, actionTypes.EDIT_ROLE_SUCCEED,
        actionTypes.EDIT_ROLE_FAIL,
      ],
      endpoint: 'v1/tenant/role/edit',
      method: 'post',
      data: form,
    },
  };
}

export function submit(form) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_ROLE, actionTypes.SUBMIT_ROLE_SUCCEED,
        actionTypes.SUBMIT_ROLE_FAIL,
      ],
      endpoint: 'v1/tenant/role/submit',
      method: 'post',
      data: form,
    },
  };
}

export function switchEnable(role, index, enabled) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SWITCH_ENABLE, actionTypes.SWITCH_ENABLE_SUCCEED,
        actionTypes.SWITCH_ENABLE_FAIL,
      ],
      endpoint: 'v1/role/switch/enabled',
      method: 'post',
      data: { roleId: role.id, enabled },
      extra: { index, enabled },
    },
  };
}

export function toggleRoleModal(visible) {
  return {
    type: actionTypes.TOGGLE_ROLE_MODAL,
    visible,
  };
}
