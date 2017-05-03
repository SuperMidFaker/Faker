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
  'UPDATE_CUSTOMER_NAMES', 'UPDATE_CUSTOMER_NAMES_SUCCEED', 'UPDATE_CUSTOMER_NAMES_FAIL',
]);

const initialState = {
  loaded: true,
  loading: false,
  customers: [],
  subCustomers: [],
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
      return { ...state, customerModal: {
        visible: true,
        ...action.data,
      } };
    }
    case actionTypes.HIDE_CUSTOMER_MODAL: {
      return { ...state, customerModal: {
        ...initialState.customerModal,
        visible: false,
      } };
    }
    case actionTypes.LOAD_SUB_CUSTOMERS_SUCCEED: {
      return { ...state, subCustomers: action.result.data };
    }
    case actionTypes.SHOW_SUB_CUSTOMER_MODAL: {
      return { ...state, subCustomerModal: {
        visible: true,
        ...action.data,
      } };
    }
    case actionTypes.HIDE_SUB_CUSTOMER_MODAL: {
      return { ...state, subCustomerModal: {
        ...initialState.subCustomerModal,
        visible: false,
      } };
    }
    case actionTypes.UPDATE_CUSTOMER_NAMES_SUCCEED: {
      return { ...state, loaded: false };
    }
    default:
      return state;
  }
}

export function loadCustomers(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMERS,
        actionTypes.LOAD_CUSTOMERS_SUCCEED,
        actionTypes.LOAD_CUSTOMERS_FAIL,
      ],
      endpoint: 'v1/crm/customers',
      method: 'get',
      params,
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

export function updateCustomerNames(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CUSTOMER_NAMES,
        actionTypes.UPDATE_CUSTOMER_NAMES_SUCCEED,
        actionTypes.UPDATE_CUSTOMER_NAMES_FAIL,
      ],
      endpoint: 'v1/crm/customerNames/edit',
      method: 'post',
      data,
    },
  };
}
