import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/bill/template', [
  'LOAD_BILL_TEMPLATES', 'LOAD_BILL_TEMPLATES_SUCCEED', 'LOAD_BILL_TEMPLATES_FAIL',
  'TOGGLE_NEW_TEMPLATE_MODAL',
  'CREATE_TEMPLATE', 'CREATE_TEMPLATE_SUCCEED', 'CREATE_TEMPLATE_FAIL',
  'DELETE_TEMPLATES', 'DELETE_TEMPLATES_SUCCEED', 'DELETE_TEMPLATES_FAIL',
  'LOAD_TEMPLATE_FEES', 'LOAD_TEMPLATE_FEES_SUCCEED', 'LOAD_TEMPLATE_FEES_FAIL',
  'ADD_TEMPLATE_FEE', 'ADD_TEMPLATE_FEE_SUCCEED', 'ADD_TEMPLATE_FEE_FAIL',
  'UPDATE_TEMPLATE_FEE', 'UPDATE_TEMPLATE_FEE_SUCCEED', 'UPDATE_TEMPLATE_FEE_FAIL',
  'DELETE_TEMPLATE_FEES', 'DELETE_TEMPLATE_FEES_SUCCEED', 'DELETE_TEMPLATE_FEES_FAIL',
]);

const initialState = {
  billTemplatelist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  templateListFilter: {
  },
  visibleNewTemplateModal: false,
  templateFeelist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  templateFeeListLoading: false,
  templateFeeListFilter: {
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BILL_TEMPLATES:
      return {
        ...state,
        templateListFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_BILL_TEMPLATES_SUCCEED:
      return { ...state, billTemplatelist: action.result.data };
    case actionTypes.TOGGLE_NEW_TEMPLATE_MODAL:
      return { ...state, visibleNewTemplateModal: action.data };
    case actionTypes.LOAD_TEMPLATE_FEES:
      return {
        ...state,
        templateFeeListFilter: JSON.parse(action.params.filter),
        templateFeeListLoading: true,
      };
    case actionTypes.LOAD_TEMPLATE_FEES_SUCCEED:
      return { ...state, templateFeeListLoading: false, templateFeelist: action.result.data };
    case actionTypes.LOAD_TEMPLATE_FEES_FAIL:
      return { ...state, templateFeeListLoading: false };
    default:
      return state;
  }
}

export function toggleNewTemplateModal(visible) {
  return {
    type: actionTypes.TOGGLE_NEW_TEMPLATE_MODAL,
    data: visible,
  };
}

export function loadBillTemplates(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_TEMPLATES,
        actionTypes.LOAD_BILL_TEMPLATES_SUCCEED,
        actionTypes.LOAD_BILL_TEMPLATES_FAIL,
      ],
      endpoint: 'v1/bss/bill/templates/load',
      method: 'get',
      params,
    },
  };
}

export function createTemplate(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_TEMPLATE,
        actionTypes.CREATE_TEMPLATE_SUCCEED,
        actionTypes.CREATE_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/bss/bill/template/create',
      method: 'post',
      data,
    },
  };
}

export function deleteBillTemplates(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TEMPLATES,
        actionTypes.DELETE_TEMPLATES_SUCCEED,
        actionTypes.DELETE_TEMPLATES_FAIL,
      ],
      endpoint: 'v1/bss/bill/templates/delete',
      method: 'post',
      data,
    },
  };
}

export function loadTemplateFees(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TEMPLATE_FEES,
        actionTypes.LOAD_TEMPLATE_FEES_SUCCEED,
        actionTypes.LOAD_TEMPLATE_FEES_FAIL,
      ],
      endpoint: 'v1/bss/bill/template/fees/load',
      method: 'get',
      params,
    },
  };
}

export function addTemplateFee(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_TEMPLATE_FEE,
        actionTypes.ADD_TEMPLATE_FEE_SUCCEED,
        actionTypes.ADD_TEMPLATE_FEE_FAIL,
      ],
      endpoint: 'v1/bss/bill/template/fee/add',
      method: 'post',
      data,
    },
  };
}

export function deleteTemplateFees(feeUids) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TEMPLATE_FEES,
        actionTypes.DELETE_TEMPLATE_FEES_SUCCEED,
        actionTypes.DELETE_TEMPLATE_FEES_FAIL,
      ],
      endpoint: 'v1/bss/bill/template/fees/delete',
      method: 'post',
      data: { feeUids },
    },
  };
}

export function updateTemplateFee(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_TEMPLATE_FEE,
        actionTypes.UPDATE_TEMPLATE_FEE_SUCCEED,
        actionTypes.UPDATE_TEMPLATE_FEE_FAIL,
      ],
      endpoint: 'v1/bss/bill/template/fee/update',
      method: 'post',
      data,
    },
  };
}
