import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/crm/customers/',
  ['LOAD_CUSTOMERS', 'LOAD_CUSTOMERS_FAIL', 'LOAD_CUSTOMERS_SUCCEED',
  'ADD_CUSTOMER', 'ADD_CUSTOMER_FAIL', 'ADD_CUSTOMER_SUCCEED',

   ]);

const initialState = {
  loaded: true,
  loading: false,
  customers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CUSTOMERS_SUCCEED:
      return { ...state, customers: action.result.data };
    case actionTypes.ADD_CUSTOMER_SUCCEED: {
      const customers = [...state.customers];
      customers.unshift(action.result.data);
      return { ...state, customers };
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

export function addCustomer({ tenantId, partnerInfo, customerTypes }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_CUSTOMER,
        actionTypes.ADD_CUSTOMER_SUCCEED,
        actionTypes.ADD_CUSTOMER_FAIL,
      ],
      endpoint: 'v1/crm/customer/add',
      method: 'post',
      data: { tenantId, partnerInfo, customerTypes },
    },
  };
}
