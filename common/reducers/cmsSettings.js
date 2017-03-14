import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/settings/', [
  'LOAD_BILL_TEMPLATES', 'LOAD_BILL_TEMPLATES_SUCCEED', 'LOAD_BILL_TEMPLATES_FAIL',
  'CREATE_BILL_TEMPLATE', 'CREATE_BILL_TEMPLATE_SUCCEED', 'CREATE_BILL_TEMPLATE_FAIL',
  'DELETE_TEMPLATE', 'DELETE_TEMPLATE_SUCCEED', 'DELETE_TEMPLATE_FAIL',
  'TOGGLE_BILL_TEMPLATE', 'OPEN_ADD_MODEL', 'CLOSE_ADD_MODEL',
  'LOAD_RELATED_CUSTOMERS', 'LOAD_RELATED_CUSTOMERS_SUCCEED', 'LOAD_RELATED_CUSTOMERS_FAIL',
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
    default:
      return state;
  }
}

export function loadBillemplates(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_TEMPLATES,
        actionTypes.LOAD_BILL_TEMPLATES_SUCCEED,
        actionTypes.LOAD_BILL_TEMPLATES_FAIL,
      ],
      endpoint: 'v1/cms/settings/billtemplates/load',
      method: 'get',
      params: { tenantId },
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

export function loadRelatedCustomers(templatedId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RELATED_CUSTOMERS,
        actionTypes.LOAD_RELATED_CUSTOMERS_SUCCEED,
        actionTypes.LOAD_RELATED_CUSTOMERS_FAIL,
      ],
      endpoint: 'v1/cms/settings/related/customers/load',
      method: 'get',
      params: { templatedId },
    },
  };
}
