import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/crm/customers/', [
  'LOAD_CUSTOMERS', 'LOAD_CUSTOMERS_FAIL', 'LOAD_CUSTOMERS_SUCCEED',
  'LOAD_BUSINESS_MODELS', 'LOAD_BUSINESS_MODELS_FAIL', 'LOAD_BUSINESS_MODELS_SUCCEED',
  'ADD_CUSTOMER', 'ADD_CUSTOMER_FAIL', 'ADD_CUSTOMER_SUCCEED',
  'EDIT_CUSTOMER', 'EDIT_CUSTOMER_FAIL', 'EDIT_CUSTOMER_SUCCEED',
  'DELETE_CUSTOMER', 'DELETE_CUSTOMER_SUCCEED', 'DELETE_CUSTOMER_FAIL',
  'SHOW_CUSTOMER_MODAL', 'HIDE_CUSTOMER_MODAL',
  'ADD_MODEL',
  'DELETE_MODEL',
  'ADD_MODELNODE_MODEL',
  'DELETE_MODELNODE_MODEL',
  'DELETE_BUSINESS_MODEL', 'DELETE_BUSINESS_MODEL_SUCCEED', 'DELETE_BUSINESS_MODEL_FAIL',
  'ADD_BUSINESS_MODEL', 'ADD_BUSINESS_MODEL_SUCCEED', 'ADD_BUSINESS_MODEL_FAIL',
  'UPDATE_BUSINESS_MODEL', 'UPDATE_BUSINESS_MODEL_SUCCEED', 'UPDATE_BUSINESS_MODEL_FAIL',
]);

const initialState = {
  loaded: true,
  loading: false,
  businessModelsLoaded: true,
  customers: [],
  formData: {
  },
  businessModels: [],
  customerModal: {
    visible: false,
    operation: '',
    customer: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CUSTOMERS:
      return { ...state, loading: true };
    case actionTypes.LOAD_CUSTOMERS_SUCCEED:
      return { ...state, customers: action.result.data, loaded: true, loading: false };
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
    case actionTypes.LOAD_BUSINESS_MODELS_SUCCEED: {
      return { ...state, businessModels: action.result.data, businessModelsLoaded: true };
    }
    case actionTypes.ADD_MODEL: {
      const businessModels = [...state.businessModels];
      businessModels.push(action.data);
      return { ...state, businessModels };
    }
    case actionTypes.DELETE_MODEL: {
      const businessModels = [...state.businessModels];
      businessModels.splice(action.data, 1);
      return { ...state, businessModels };
    }
    case actionTypes.ADD_MODELNODE_MODEL: {
      const { index, value } = action.data;
      const businessModels = [...state.businessModels];
      const businessModel = { ...businessModels[index] };
      let array = [];
      if (businessModel.model !== '') {
        array = businessModel.model.split(',');
      }
      array.push(value);
      businessModel.model = array.join(',');
      businessModels.splice(index, 1, businessModel);
      return { ...state, businessModels };
    }
    case actionTypes.DELETE_MODELNODE_MODEL: {
      const { index, position } = action.data;
      const businessModels = [...state.businessModels];
      const businessModel = { ...businessModels[index] };
      let array = [];
      if (businessModel.model !== '') {
        array = businessModel.model.split(',');
      }
      array.splice(position, 1);
      businessModel.model = array.join(',');
      businessModels.splice(index, 1, businessModel);
      return { ...state, businessModels };
    }
    case actionTypes.DELETE_BUSINESS_MODEL_SUCCEED: {
      return { ...state, businessModelsLoaded: false };
    }
    case actionTypes.ADD_BUSINESS_MODEL_SUCCEED: {
      return { ...state, businessModelsLoaded: false };
    }
    case actionTypes.UPDATE_BUSINESS_MODEL_SUCCEED: {
      return { ...state, businessModelsLoaded: false };
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

export function loadBusinessModels({ partnerId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BUSINESS_MODELS,
        actionTypes.LOAD_BUSINESS_MODELS_SUCCEED,
        actionTypes.LOAD_BUSINESS_MODELS_FAIL,
      ],
      endpoint: 'v1/crm/customer/business/models',
      method: 'get',
      params: { partnerId, tenantId },
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

export function addModel(model) {
  return { type: actionTypes.ADD_MODEL, data: model };
}

export function deleteModel(index) {
  return { type: actionTypes.DELETE_MODEL, data: index };
}

export function addModelNode(index, value) {
  return { type: actionTypes.ADD_MODELNODE_MODEL, data: { index, value } };
}

export function deleteModelNode(index, position) {
  return { type: actionTypes.DELETE_MODELNODE_MODEL, data: { index, position } };
}

export function deleteBusinessModel(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_BUSINESS_MODEL,
        actionTypes.DELETE_BUSINESS_MODEL_SUCCEED,
        actionTypes.DELETE_BUSINESS_MODEL_FAIL,
      ],
      endpoint: 'v1/crm/customer/business/model/delete',
      method: 'post',
      data: {
        id,
      },
    },
  };
}

export function addBusinessModel(tenantId, partnerId, partnerTenantId, model) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BUSINESS_MODEL,
        actionTypes.ADD_BUSINESS_MODEL_SUCCEED,
        actionTypes.ADD_BUSINESS_MODEL_FAIL,
      ],
      endpoint: 'v1/crm/customer/business/model/add',
      method: 'post',
      data: {
        tenantId, partnerId, partnerTenantId, model,
      },
    },
  };
}

export function updateBusinessModel(id, model) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BUSINESS_MODEL,
        actionTypes.UPDATE_BUSINESS_MODEL_SUCCEED,
        actionTypes.UPDATE_BUSINESS_MODEL_FAIL,
      ],
      endpoint: 'v1/crm/customer/business/model/update',
      method: 'post',
      data: {
        id, model,
      },
    },
  };
}
