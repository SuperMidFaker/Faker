import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/settings/', [
  'ADD_RELATED_CUSTOMER', 'ADD_RELATED_CUSTOMER_SUCCEED', 'ADD_RELATED_CUSTOMER_FAIL',
  'LOAD_RELATED_CUSTOMERS', 'LOAD_RELATED_CUSTOMERS_SUCCEED', 'LOAD_RELATED_CUSTOMERS_FAIL',
  'DELETE_RELATED_CUSTOMER', 'DELETE_RELATED_CUSTOMER_SUCCEED', 'DELETE_RELATED_CUSTOMER_FAIL',
  'LOAD_FORM_VALS', 'LOAD_FORM_VALS_SUCCEED', 'LOAD_FORM_VALS_FAIL',
  'SAVE_TEMPLATE_DATA', 'SAVE_TEMPLATE_DATA_SUCCEED', 'SAVE_TEMPLATE_DATA_FAIL',
  'SAVE_GENERATED_TEMPLATE', 'SAVE_GENERATED_TEMPLATE_SUCCEED', 'SAVE_GENERATED_TEMPLATE_FAIL',
  'VALIDATE_NAME', 'VALIDATE_NAME_SUCCEED', 'VALIDATE_NAME_FAIL',
  'ADD_BILL_TEMPLATE_USER', 'ADD_BILL_TEMPLATE_USER_SUCCEED', 'ADD_BILL_TEMPLATE_USER_FAIL',
  'DELETE_BILL_TEMPLATE_USER', 'DELETE_BILL_TEMPLATE_USER_SUCCEED', 'DELETE_BILL_TEMPLATE_USER_FAIL',
  'LOAD_BILL_TEMPLATE_USERS', 'LOAD_BILL_TEMPLATE_USERS_SUCCEED', 'LOAD_BILL_TEMPLATE_USERS_FAIL',
  'COUNT_FIELDS_CHANGE',
]);

const initialState = {
  templateValLoading: false,
  template: {},
  billtemplates: [],
  billTemplateModal: {
    visible: false,
    templateName: '',
  },
  billHead: {},
  visibleAddModal: false,
  relatedCustomers: [],
  billTemplateUsers: [],
  formData: {},
  changeTimes: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_RELATED_CUSTOMERS_SUCCEED:
      return { ...state, relatedCustomers: action.result.data };
    case actionTypes.LOAD_FORM_VALS:
      return { ...state, templateValLoading: true };
    case actionTypes.LOAD_FORM_VALS_SUCCEED: {
      const retData = action.result.data.template;
      if (retData.i_e_type === 0) {
        retData.ietype = 'import';
      } else if (retData.i_e_type === 1) {
        retData.ietype = 'export';
      }
      return { ...state, template: { ...state.template, ...retData }, relatedCustomers: action.result.data.customers,
        formData: action.result.data.formData, billTemplateUsers: action.result.data.users, templateValLoading: false };
    }
    case actionTypes.LOAD_BILL_TEMPLATE_USERS_SUCCEED:
      return { ...state, billTemplateUsers: action.result.data };
    case actionTypes.LOAD_FORM_VALS_FAIL:
      return { ...state, templateValLoading: false };
    case actionTypes.COUNT_FIELDS_CHANGE:
      return { ...state, changeTimes: state.changeTimes + 1 };
    default:
      return state;
  }
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

export function addBillTemplateUser(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BILL_TEMPLATE_USER,
        actionTypes.ADD_BILL_TEMPLATE_USER_SUCCEED,
        actionTypes.ADD_BILL_TEMPLATE_USER_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/user/add',
      method: 'post',
      data: datas,
    },
  };
}

export function deleteBillTemplateUser(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_BILL_TEMPLATE_USER,
        actionTypes.DELETE_BILL_TEMPLATE_USER_SUCCEED,
        actionTypes.DELETE_BILL_TEMPLATE_USER_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/user/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function loadBillTemplateUsers(templateId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_TEMPLATE_USERS,
        actionTypes.LOAD_BILL_TEMPLATE_USERS_SUCCEED,
        actionTypes.LOAD_BILL_TEMPLATE_USERS_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplate/users',
      method: 'get',
      params: { templateId },
    },
  };
}

export function countFieldsChange(values) {
  return {
    type: actionTypes.COUNT_FIELDS_CHANGE,
    data: values,
  };
}
