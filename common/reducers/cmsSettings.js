import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/settings/', [
  'LOAD_BILL_TEMPLATES', 'LOAD_BILL_TEMPLATES_SUCCEED', 'LOAD_BILL_TEMPLATES_FAIL',
  'CREATE_BILL_TEMPLATE', 'CREATE_BILL_TEMPLATE_SUCCEED', 'CREATE_BILL_TEMPLATE_FAIL',
  'DELETE_TEMPLATE', 'DELETE_TEMPLATE_SUCCEED', 'DELETE_TEMPLATE_FAIL',
  'TOGGLE_BILL_TEMPLATE', 'OPEN_ADD_MODEL', 'CLOSE_ADD_MODEL',
  'ADD_RELATED_CUSTOMER', 'ADD_RELATED_CUSTOMER_SUCCEED', 'ADD_RELATED_CUSTOMER_FAIL',
  'LOAD_RELATED_CUSTOMERS', 'LOAD_RELATED_CUSTOMERS_SUCCEED', 'LOAD_RELATED_CUSTOMERS_FAIL',
  'DELETE_RELATED_CUSTOMER', 'DELETE_RELATED_CUSTOMER_SUCCEED', 'DELETE_RELATED_CUSTOMER_FAIL',
  'LOAD_FORM_VALS', 'LOAD_FORM_VALS_SUCCEED', 'LOAD_FORM_VALS_FAIL',
  'SAVE_TEMPLATE_DATA', 'SAVE_TEMPLATE_DATA_SUCCEED', 'SAVE_TEMPLATE_DATA_FAIL',
  'SAVE_GENERATED_TEMPLATE', 'SAVE_GENERATED_TEMPLATE_SUCCEED', 'SAVE_GENERATED_TEMPLATE_FAIL',
  'VALIDATE_NAME', 'VALIDATE_NAME_SUCCEED', 'VALIDATE_NAME_FAIL',
]);

const initialState = {
  template: {},
  billtemplates: [],
  billTemplateModal: {
    visible: false,
    templateName: '',
  },
  billHead: {},
  visibleAddModal: false,
  relatedCustomers: [],
  formData: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BILL_TEMPLATES_SUCCEED:
      return { ...state, billtemplates: action.result.data };
    case actionTypes.CREATE_BILL_TEMPLATE_SUCCEED: {
      const retData = action.result.data;
      if (retData.i_e_type === 0) {
        retData.ietype = 'import';
      } else if (retData.i_e_type === 1) {
        retData.ietype = 'export';
      }
      return { ...state, template: { ...state.template, ...retData } };
    }
    case actionTypes.TOGGLE_BILL_TEMPLATE: {
      return { ...state, billTemplateModal: { ...state.billTemplateModal, ...action.data } };
    }
    case actionTypes.OPEN_ADD_MODEL:
      return { ...state, visibleAddModal: true };
    case actionTypes.CLOSE_ADD_MODEL:
      return { ...state, visibleAddModal: false };
    case actionTypes.LOAD_RELATED_CUSTOMERS_SUCCEED:
      return { ...state, relatedCustomers: action.result.data };
    case actionTypes.LOAD_FORM_VALS_SUCCEED: {
      const retData = action.result.data.template;
      if (retData.i_e_type === 0) {
        retData.ietype = 'import';
      } else if (retData.i_e_type === 1) {
        retData.ietype = 'export';
      }
      return { ...state, template: { ...state.template, ...retData }, relatedCustomers: action.result.data.customers,
        formData: action.result.data.formData };
    }
    default:
      return state;
  }
}

export function loadBillemplates(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_TEMPLATES,
        actionTypes.LOAD_BILL_TEMPLATES_SUCCEED,
        actionTypes.LOAD_BILL_TEMPLATES_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplates/load',
      method: 'get',
      params,
    },
  };
}

export function createBillTemplate(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILL_TEMPLATE,
        actionTypes.CREATE_BILL_TEMPLATE_SUCCEED,
        actionTypes.CREATE_BILL_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/create',
      method: 'post',
      data: datas,
    },
  };
}

export function deleteTemplate(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TEMPLATE,
        actionTypes.DELETE_TEMPLATE_SUCCEED,
        actionTypes.DELETE_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function toggleBillTempModal(visible, operation, templateName) {
  return {
    type: actionTypes.TOGGLE_BILL_TEMPLATE,
    data: { visible, operation, templateName },
  };
}

export function openAddModal() {
  return { type: actionTypes.OPEN_ADD_MODEL };
}

export function closeAddModal() {
  return { type: actionTypes.CLOSE_ADD_MODEL };
}

export function addRelatedCusromer(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_RELATED_CUSTOMER,
        actionTypes.ADD_RELATED_CUSTOMER_SUCCEED,
        actionTypes.ADD_RELATED_CUSTOMER_FAIL,
      ],
      endpoint: 'v1/cms/settings/related/customer/add',
      method: 'post',
      data: datas,
    },
  };
}

export function loadRelatedCustomers(templateId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RELATED_CUSTOMERS,
        actionTypes.LOAD_RELATED_CUSTOMERS_SUCCEED,
        actionTypes.LOAD_RELATED_CUSTOMERS_FAIL,
      ],
      endpoint: 'v1/cms/settings/related/customers/load',
      method: 'get',
      params: { templateId },
    },
  };
}

export function deleteRelatedCustomer(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_RELATED_CUSTOMER,
        actionTypes.DELETE_RELATED_CUSTOMER_SUCCEED,
        actionTypes.DELETE_RELATED_CUSTOMER_FAIL,
      ],
      endpoint: 'v1/cms/settings/related/customers/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function loadTemplateFormVals(templateId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FORM_VALS,
        actionTypes.LOAD_FORM_VALS_SUCCEED,
        actionTypes.LOAD_FORM_VALS_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/form/values/load',
      method: 'get',
      params: { templateId },
    },
  };
}

export function saveTemplateData(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_TEMPLATE_DATA,
        actionTypes.SAVE_TEMPLATE_DATA_SUCCEED,
        actionTypes.SAVE_TEMPLATE_DATA_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/formdata/save',
      method: 'post',
      data: datas,
    },
  };
}

export function createGeneratedTemplate(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_GENERATED_TEMPLATE,
        actionTypes.SAVE_GENERATED_TEMPLATE_SUCCEED,
        actionTypes.SAVE_GENERATED_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/generated/create',
      method: 'post',
      data: datas,
    },
  };
}

export function validateTempName(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.VALIDATE_NAME,
        actionTypes.VALIDATE_NAME_SUCCEED,
        actionTypes.VALIDATE_NAME_FAIL,
      ],
      endpoint: 'v1/cms/settings/template/validate/name',
      method: 'get',
      params,
    },
  };
}
