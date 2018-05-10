import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/crm/customers/', [
  'HIDE_SERVICETEAM_MODAL', 'SHOW_SERVICETEAM_MODAL',
  'LOAD_SERVICETEAM_MEMBERS', 'LOAD_SERVICETEAM_MEMBERS_SUCCEED', 'LOAD_SERVICETEAM_MEMBERS_FAIL',
  'ADD_SERVICETEAM_MEMBERS', 'ADD_SERVICETEAM_MEMBERS_SUCCEED', 'ADD_SERVICETEAM_MEMBERS_FAIL',
  'LOAD_TENANT_USERS', 'LOAD_TENANT_USERS_SUCCEED', 'LOAD_TENANT_USERS_FAIL',
  'LOAD_OPERATORS', 'LOAD_OPERATORS_SUCCEED', 'LOAD_OPERATORS_FAIL',
  'LOAD_SERVICETEAM_USERIDS', 'LOAD_SERVICETEAM_USERIDS_SUCCEED', 'LOAD_SERVICETEAM_USERIDS_FAIL',
]);

const initialState = {
  serviceTeamMembers: [],
  operators: [],
  serviceTeamModal: {
    visible: false,
    tenantUsers: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.HIDE_SERVICETEAM_MODAL: {
      return {
        ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          visible: false,
        },
      };
    }
    case actionTypes.SHOW_SERVICETEAM_MODAL: {
      return {
        ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          visible: true,
        },
      };
    }
    case actionTypes.LOAD_TENANT_USERS_SUCCEED: {
      return {
        ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          tenantUsers: action.result.data.users,
        },
      };
    }
    case actionTypes.LOAD_SERVICETEAM_MEMBERS_SUCCEED: {
      return { ...state, serviceTeamMembers: action.result.data };
    }
    case actionTypes.LOAD_OPERATORS_SUCCEED: {
      return { ...state, operators: action.result.data };
    }
    default:
      return state;
  }
}

export function showServiceTeamModal() {
  return { type: actionTypes.SHOW_SERVICETEAM_MODAL };
}

export function loadTenantUsers(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TENANT_USERS,
        actionTypes.LOAD_TENANT_USERS_SUCCEED,
        actionTypes.LOAD_TENANT_USERS_FAIL,
      ],
      endpoint: 'v1/user/corp/tenant/users',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function hideServiceTeamModal() {
  return { type: actionTypes.HIDE_SERVICETEAM_MODAL };
}

export function loadServiceTeamMembers(partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SERVICETEAM_MEMBERS,
        actionTypes.LOAD_SERVICETEAM_MEMBERS_SUCCEED,
        actionTypes.LOAD_SERVICETEAM_MEMBERS_FAIL,
      ],
      endpoint: 'v1/scof/customer/load/serviceTeam/members',
      method: 'get',
      params: { partnerId },
    },
  };
}

export function loadTeamUserIds(partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SERVICETEAM_USERIDS,
        actionTypes.LOAD_SERVICETEAM_USERIDS_SUCCEED,
        actionTypes.LOAD_SERVICETEAM_USERIDS_FAIL,
      ],
      endpoint: 'v1/scof/customer/load/serviceTeam/userids',
      method: 'get',
      params: { partnerId },
    },
  };
}

export function addServiceTeamMembers(partnerId, userIds) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SERVICETEAM_MEMBERS,
        actionTypes.ADD_SERVICETEAM_MEMBERS_SUCCEED,
        actionTypes.ADD_SERVICETEAM_MEMBERS_FAIL,
      ],
      endpoint: 'v1/scof/customer/add/serviceTeam/members',
      method: 'post',
      data: { partnerId, userIds },
    },
  };
}

export function loadOperators(partnerId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OPERATORS,
        actionTypes.LOAD_OPERATORS_SUCCEED,
        actionTypes.LOAD_OPERATORS_FAIL,
      ],
      endpoint: 'v1/scof/customer/operators',
      method: 'get',
      params: { partnerId, tenantId },
    },
  };
}
