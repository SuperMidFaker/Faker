import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/crm/customers/', [
  'LOAD_CUSTOMERS', 'LOAD_CUSTOMERS_FAIL', 'LOAD_CUSTOMERS_SUCCEED',
  'ADD_CUSTOMER', 'ADD_CUSTOMER_FAIL', 'ADD_CUSTOMER_SUCCEED',
  'EDIT_CUSTOMER', 'EDIT_CUSTOMER_FAIL', 'EDIT_CUSTOMER_SUCCEED',
  'DELETE_CUSTOMER', 'DELETE_CUSTOMER_SUCCEED', 'DELETE_CUSTOMER_FAIL',
  'SHOW_CUSTOMER_MODAL', 'HIDE_CUSTOMER_MODAL',
  'LOAD_SUB_CUSTOMERS', 'LOAD_SUB_CUSTOMERS_FAIL', 'LOAD_SUB_CUSTOMERS_SUCCEED',
  'SHOW_SUB_CUSTOMER_MODAL', 'HIDE_SUB_CUSTOMER_MODAL',
  'LOAD_CUSTOMER_FLOWS', 'LOAD_CUSTOMER_FLOWS_FAIL', 'LOAD_CUSTOMER_FLOWS_SUCCEED',
  'HIDE_SERVICETEAM_MODAL', 'SHOW_SERVICETEAM_MODAL',
  'LOAD_SERVICETEAM_MEMBERS', 'LOAD_SERVICETEAM_MEMBERS_SUCCEED', 'LOAD_SERVICETEAM_MEMBERS_FAIL',
  'ADD_SERVICETEAM_MEMBERS', 'ADD_SERVICETEAM_MEMBERS_SUCCEED', 'ADD_SERVICETEAM_MEMBERS_FAIL',
  'LOAD_TENANT_USERS', 'LOAD_TENANT_USERS_SUCCEED', 'LOAD_TENANT_USERS_FAIL',
  'LOAD_TRANSPORT_TRAIFFS', 'LOAD_TRANSPORT_TRAIFFS_SUCCEED', 'LOAD_TRANSPORT_TRAIFFS_FAIL',
  'LOAD_CMS_QUOTES', 'LOAD_CMS_QUOTES_SUCCEED', 'LOAD_CMS_QUOTES_FAIL',
  'LOAD_OPERATORS', 'LOAD_OPERATORS_SUCCEED', 'LOAD_OPERATORS_FAIL',
  'LOAD_SERVICETEAM_USERIDS', 'LOAD_SERVICETEAM_USERIDS_SUCCEED', 'LOAD_SERVICETEAM_USERIDS_FAIL',
]);

const initialState = {
  loaded: true,
  loading: false,
  customers: [],
  subCustomers: [],
  serviceTeamMembers: [],
  operators: [],
  formData: {
  },
  customerModal: {
    visible: false,
    operation: '',
    customer: {},
  },
  subCustomerModal: {
    visible: false,
    operation: '',
    customer: {},
  },
  serviceTeamModal: {
    visible: false,
    tenantUsers: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CUSTOMERS:
      return { ...state, loading: true };
    case actionTypes.LOAD_CUSTOMERS_SUCCEED: {
      const customers = action.result.data.filter(customer => !customer.parent_id).map((customer) => {
        const subCustomers = [...action.result.data.filter(cus => cus.parent_id === customer.id)];
        const children = subCustomers.length > 0 ? subCustomers : null;
        return { ...customer, subCustomers, children };
      });
      return { ...state, customers, loaded: true, loading: false };
    }
    case actionTypes.LOAD_CUSTOMERS_FAIL: {
      return { ...state, loading: false };
    }
    case actionTypes.ADD_CUSTOMER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.DELETE_CUSTOMER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.EDIT_CUSTOMER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.SHOW_CUSTOMER_MODAL: {
      return { ...state,
        customerModal: {
          visible: true,
          ...action.data,
        } };
    }
    case actionTypes.HIDE_CUSTOMER_MODAL: {
      return { ...state,
        customerModal: {
          ...initialState.customerModal,
          visible: false,
        } };
    }
    case actionTypes.LOAD_SUB_CUSTOMERS_SUCCEED: {
      return { ...state, subCustomers: action.result.data };
    }
    case actionTypes.SHOW_SUB_CUSTOMER_MODAL: {
      return { ...state,
        subCustomerModal: {
          visible: true,
          ...action.data,
        } };
    }
    case actionTypes.HIDE_SUB_CUSTOMER_MODAL: {
      return { ...state,
        subCustomerModal: {
          ...initialState.subCustomerModal,
          visible: false,
        } };
    }
    case actionTypes.HIDE_SERVICETEAM_MODAL: {
      return { ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          visible: false,
        },
      };
    }
    case actionTypes.SHOW_SERVICETEAM_MODAL: {
      return { ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          visible: true,
        } };
    }
    case actionTypes.LOAD_TENANT_USERS_SUCCEED: {
      return { ...state,
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

export function loadCustomers() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMERS,
        actionTypes.LOAD_CUSTOMERS_SUCCEED,
        actionTypes.LOAD_CUSTOMERS_FAIL,
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params: { role: 'CUS' },
    },
  };
}

export function addCustomer({ tenantId, partnerInfo, businessType }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_CUSTOMER,
        actionTypes.ADD_CUSTOMER_SUCCEED,
        actionTypes.ADD_CUSTOMER_FAIL,
      ],
      endpoint: 'v1/crm/customer/add',
      method: 'post',
      data: { tenantId, partnerInfo, businessType },
    },
  };
}

export function editCustomer({ tenantId, partnerInfo, businessType }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_CUSTOMER,
        actionTypes.EDIT_CUSTOMER_SUCCEED,
        actionTypes.EDIT_CUSTOMER_FAIL,
      ],
      endpoint: 'v1/crm/customer/edit',
      method: 'post',
      data: { tenantId, partnerInfo, businessType },
    },
  };
}

export function deleteCustomer(id, role) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_CUSTOMER,
        actionTypes.DELETE_CUSTOMER_SUCCEED,
        actionTypes.DELETE_CUSTOMER_FAIL,
      ],
      endpoint: 'v1/crm/customer/delete',
      method: 'post',
      id,
      data: {
        id, role,
      },
    },
  };
}

export function showCustomerModal(operation = '', customer = {}) {
  return { type: actionTypes.SHOW_CUSTOMER_MODAL, data: { operation, customer } };
}

export function hideCustomerModal() {
  return { type: actionTypes.HIDE_CUSTOMER_MODAL };
}

export function loadSubCustomers(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SUB_CUSTOMERS,
        actionTypes.LOAD_SUB_CUSTOMERS_SUCCEED,
        actionTypes.LOAD_SUB_CUSTOMERS_FAIL,
      ],
      endpoint: 'v1/crm/subCustomers',
      method: 'get',
      params,
    },
  };
}

export function showSubCustomerModal(operation = '', customer = {}) {
  return { type: actionTypes.SHOW_SUB_CUSTOMER_MODAL, data: { operation, customer } };
}

export function hideSubCustomerModal() {
  return { type: actionTypes.HIDE_SUB_CUSTOMER_MODAL };
}

export function loadCustomerFlows(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMER_FLOWS,
        actionTypes.LOAD_CUSTOMER_FLOWS_SUCCEED,
        actionTypes.LOAD_CUSTOMER_FLOWS_FAIL,
      ],
      endpoint: 'v1/scof/customer/list/flows',
      method: 'get',
      params,
    },
  };
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

export function loadTransportTariffs(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSPORT_TRAIFFS,
        actionTypes.LOAD_TRANSPORT_TRAIFFS_SUCCEED,
        actionTypes.LOAD_TRANSPORT_TRAIFFS_FAIL,
      ],
      endpoint: 'v1/scof/transport/tariffs',
      method: 'get',
      params: { tenantId },
      origin: 'mongo',
    },
  };
}

export function loadCmsQuotes(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CMS_QUOTES,
        actionTypes.LOAD_CMS_QUOTES_SUCCEED,
        actionTypes.LOAD_CMS_QUOTES_FAIL,
      ],
      endpoint: 'v1/scof/cms/quotes',
      method: 'get',
      params: { tenantId },
      origin: 'mongo',
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
