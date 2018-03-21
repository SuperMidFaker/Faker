import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/order/statement', [
  'LOAD_ORDER_STATEMENTS', 'LOAD_ORDER_STATEMENTS_SUCCEED', 'LOAD_ORDER_STATEMENTS_FAIL',
  'LOAD_BILL_TEMPLATES', 'LOAD_BILL_TEMPLATES_SUCCEED', 'LOAD_BILL_TEMPLATES_FAIL',
  'RELOAD_TEMPLATE_LIST',
  'TOGGLE_NEW_TEMPLATE_MODAL',
  'CREATE_TEMPLATE', 'CREATE_TEMPLATE_SUCCEED', 'CREATE_TEMPLATE_FAIL',
]);

const initialState = {
  orderStatementlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    status: 'submitted',
    clientPid: 'all',
  },
  loading: false,
  billTemplatelist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  templateListFilter: {
  },
  templatesReload: false,
  visibleNewTemplateModal: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ORDER_STATEMENTS:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        loading: true,
      };
    case actionTypes.LOAD_ORDER_STATEMENTS_SUCCEED:
      return { ...state, loading: false, auditslist: action.result.data };
    case actionTypes.LOAD_ORDER_STATEMENTS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_BILL_TEMPLATES:
      return {
        ...state,
        templateReload: false,
        templateListFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_BILL_TEMPLATES_SUCCEED:
      return { ...state, billTemplatelist: action.result.data };
    case actionTypes.TOGGLE_NEW_TEMPLATE_MODAL:
      return { ...state, visibleNewTemplateModal: action.data };
    case actionTypes.RELOAD_TEMPLATE_LIST:
      return { ...state, templatesReload: true };
    default:
      return state;
  }
}

export function loadOrderStatements(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDER_STATEMENTS,
        actionTypes.LOAD_ORDER_STATEMENTS_SUCCEED,
        actionTypes.LOAD_ORDER_STATEMENTS_FAIL,
      ],
      endpoint: 'v1/bss/order/statements/load',
      method: 'get',
      params,
    },
  };
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

export function reloadTemplateList() {
  return {
    type: actionTypes.RELOAD_TEMPLATE_LIST,
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
