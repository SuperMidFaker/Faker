import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'PARTNERS_LOAD', 'PARTNERS_LOAD_SUCCEED', 'PARTNERS_LOAD_FAIL',
  'QUOTE_MODEL_LOAD', 'QUOTE_MODEL_LOAD_SUCCEED', 'QUOTE_MODEL_LOAD_FAIL',
  'CREATE_QUOTE', 'CREATE_QUOTE_SUCCEED', 'CREATE_QUOTE_FAIL',
  'SUBMIT_QUOTE', 'SUBMIT_QUOTE_SUCCEED', 'SUBMIT_QUOTE_FAIL',
  'QUOTES_LOAD', 'QUOTES_LOAD_SUCCEED', 'QUOTES_LOAD_FAIL',
  'EDITQUOTE_LOAD', 'EDITQUOTE_LOAD_SUCCEED', 'EDITQUOTE_LOAD_FAIL',
  'QUOTE_COPY', 'QUOTE_COPY_SUCCEED', 'QUOTE_COPY_FAIL',
  'QUOTE_DELETE', 'QUOTE_DELETE_SUCCEED', 'QUOTE_DELETE_FAIL',
  'FEE_ADD', 'FEE_ADD_SUCCEED', 'FEE_ADD_FAIL',
  'FEE_UPDATE', 'FEE_UPDATE_SUCCEED', 'FEE_UPDATE_FAIL',
  'FEE_DELETE', 'FEE_DELETE_SUCCEED', 'FEE_DELETE_FAIL',
]);

const initialState = {
  partners: [],
  clients: [],
  quoteData: {
    quote_no: '',
    tariff_kind: '',
    partner: {
      name: '',
    },
    decl_way_code: [],
    trans_mode: [],
    remarks: [],
    modify_name: '',
    modify_id: '',
    valid: true,
    fees: [],
  },
  quotes: [],
  quotesLoading: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PARTNERS_LOAD_SUCCEED:
      return { ...state, partners: action.result.data.partners, clients: action.result.data.clients };
    case actionTypes.QUOTE_MODEL_LOAD:
      return { ...state, quoteData: { ...initialState.quoteData, loading: true } };
    case actionTypes.QUOTE_MODEL_LOAD_SUCCEED:
      return { ...state, quoteData: { ...action.result.data.quoteData, loading: false } };
    case actionTypes.CREATE_QUOTE:
      return { ...state, quoteData: { ...initialState.quoteData, loading: true } };
    case actionTypes.QUOTES_LOAD:
      return { ...state, quotesLoading: true };
    case actionTypes.QUOTES_LOAD_SUCCEED:
      return { ...state, quotes: action.result.data, quotesLoading: false };
    case actionTypes.EDITQUOTE_LOAD:
      return { ...state, quoteData: { ...state.quoteData, loading: true } };
    case actionTypes.EDITQUOTE_LOAD_SUCCEED:
      return { ...state, quoteData: { ...action.result.data.quoteData, loading: false } };
    case actionTypes.QUOTE_COPY:
      return { ...state, quoteData: { ...state.quoteData, loading: true } };
    case actionTypes.QUOTE_COPY_SUCCEED:
      return { ...state, quoteData: { ...action.result.data.quoteData, loading: false } };
    default:
      return state;
  }
}

export function loadPartners(tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PARTNERS_LOAD, actionTypes.PARTNERS_LOAD_SUCCEED, actionTypes.PARTNERS_LOAD_FAIL],
      endpoint: 'v1/cms/quote/partners',
      method: 'get',
      params: { tenantId },
    },
  };
}
export function loadQuoteModel() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.QUOTE_MODEL_LOAD, actionTypes.QUOTE_MODEL_LOAD_SUCCEED, actionTypes.QUOTE_MODEL_LOAD_FAIL],
      endpoint: 'v1/cms/quote/loadModel',
      method: 'get',
      origin: 'mongo',
    },
  };
}

export function createQuote(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_QUOTE,
        actionTypes.CREATE_QUOTE_SUCCEED,
        actionTypes.CREATE_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/createQuote',
      method: 'post',
      data: params,
      origin: 'mongo',
    },
  };
}

export function submitQuotes(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_QUOTE,
        actionTypes.SUBMIT_QUOTE_SUCCEED,
        actionTypes.SUBMIT_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/submitQuote',
      method: 'post',
      data: params,
      origin: 'mongo',
    },
  };
}

export function loadQuoteTable(tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.QUOTES_LOAD, actionTypes.QUOTES_LOAD_SUCCEED, actionTypes.QUOTES_LOAD_FAIL],
      endpoint: 'v1/cms/quote/load',
      method: 'get',
      params: { tenantId },
      origin: 'mongo',
    },
  };
}
export function loadEditQuote(quoteNo) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.EDITQUOTE_LOAD, actionTypes.EDITQUOTE_LOAD_SUCCEED, actionTypes.EDITQUOTE_LOAD_FAIL],
      endpoint: 'v1/cms/quote/loadquote',
      method: 'get',
      params: { quoteNo },
      origin: 'mongo',
    },
  };
}

export function copyQuote(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.QUOTE_COPY, actionTypes.QUOTE_COPY_SUCCEED, actionTypes.QUOTE_COPY_FAIL],
      endpoint: 'v1/cms/quote/quoteCopy',
      method: 'post',
      data: params,
      origin: 'mongo',
    },
  };
}

export function deleteQuote(quoteId, valid, modifyBy, modifyById) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.QUOTE_DELETE, actionTypes.QUOTE_DELETE_SUCCEED, actionTypes.QUOTE_DELETE_FAIL],
      endpoint: 'v1/cms/quote/quoteDelete',
      method: 'post',
      data: { quoteId, valid, modifyBy, modifyById },
      origin: 'mongo',
    },
  };
}

export function feeUpdate(quoteId, row) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.FEE_UPDATE, actionTypes.FEE_UPDATE_SUCCEED, actionTypes.FEE_UPDATE_FAIL],
      endpoint: 'v1/cms/quote/feeupdate',
      method: 'post',
      data: { quoteId, row },
      origin: 'mongo',
    },
  };
}

export function feeAdd(quoteId, row) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.FEE_ADD, actionTypes.FEE_ADD_SUCCEED, actionTypes.FEE_ADD_FAIL],
      endpoint: 'v1/cms/quote/feeadd',
      method: 'post',
      data: { quoteId, row },
      origin: 'mongo',
    },
  };
}

export function feeDelete(quoteId, feeId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.FEE_DELETE, actionTypes.FEE_DELETE_SUCCEED, actionTypes.FEE_DELETE_FAIL],
      endpoint: 'v1/cms/quote/feedelete',
      method: 'post',
      data: { quoteId, feeId },
      origin: 'mongo',
    },
  };
}
