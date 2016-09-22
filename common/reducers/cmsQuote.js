import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'PARTNERS_LOAD', 'PARTNERS_LOAD_SUCCEED', 'PARTNERS_LOAD_FAIL',
  'CREATE_QUOTE', 'CREATE_QUOTE_SUCCEED', 'CREATE_QUOTE_FAIL',
  'SUBMIT_QUOTE', 'SUBMIT_QUOTE_SUCCEED', 'SUBMIT_QUOTE_FAIL',
  'QUOTES_LOAD', 'QUOTES_LOAD_SUCCEED', 'QUOTES_LOAD_FAIL',
  'EDITQUOTE_LOAD', 'EDITQUOTE_LOAD_SUCCEED', 'EDITQUOTE_LOAD_FAIL',
]);

const initialState = {
  partners: [],
  clients: [],
  quoteData: {
    quote_no: '',
    tariff_kind: '',
    partners: '',
    decl_way_code: [],
    trans_mode: [],
    remarks: [],
    modify_by: '',
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
    case actionTypes.CREATE_QUOTE:
      return { ...state, quoteData: { ...initialState.quoteData, loading: true } };
    case actionTypes.CREATE_QUOTE_SUCCEED:
      return { ...state, quoteData: { ...action.result.data.quoteData, loading: false } };
    case actionTypes.QUOTES_LOAD:
      return { ...state, quotesLoading: true };
    case actionTypes.QUOTES_LOAD_SUCCEED:
      return { ...state, quotes: action.result.data, quotesLoading: false };
    case actionTypes.EDITQUOTE_LOAD:
      return { ...state, quoteData: { ...initialState.quoteData, loading: true } };
    case actionTypes.EDITQUOTE_LOAD_SUCCEED:
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

export function createQuote(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_QUOTE,
        actionTypes.CREATE_QUOTE_SUCCEED,
        actionTypes.CREATE_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/createQuote',
      method: 'post',
      data: { tenantId },
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
