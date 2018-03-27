import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'VISIBLE_QUOTE_CREATE_MODAL',
  'CREATE_QUOTE', 'CREATE_QUOTE_SUCCEED', 'CREATE_QUOTE_FAIL',
  'QUOTES_LOAD', 'QUOTES_LOAD_SUCCEED', 'QUOTES_LOAD_FAIL',
  'QUOTE_PARAMS_LOAD', 'QUOTE_PARAMS_LOAD_SUCCEED', 'QUOTE_PARAMS_LOAD_FAIL',
  'QUOTE_FEES_LOAD', 'QUOTE_FEES_LOAD_SUCCEED', 'QUOTE_FEES_LOAD_FAIL',
  'QUOTE_COPY', 'QUOTE_COPY_SUCCEED', 'QUOTE_COPY_FAIL',
  'QUOTES_DELETE', 'QUOTES_DELETE_SUCCEED', 'QUOTES_DELETE_FAIL',
  'FEES_ADD', 'FEES_ADD_SUCCEED', 'FEES_ADD_FAIL',
  'FEE_UPDATE', 'FEE_UPDATE_SUCCEED', 'FEE_UPDATE_FAIL',
  'FEES_DELETE', 'FEES_DELETE_SUCCEED', 'FEES_DELETE_FAIL',
  'REVISE_QUOTE_SETTING', 'REVISE_QUOTE_SETTING_SUCCEED', 'REVISE_QUOTE_SETTING_FAIL',
  'PUBLISH_QUOTE', 'PUBLISH_QUOTE_SUCCEED', 'PUBLISH_QUOTE_FAIL',
  'CLOSE_PUBLISH_MODAL', 'OPEN_PUBLISH_MODAL',
  'SAVE_QUOTE_EDIT', 'SAVE_QUOTE_EDIT_SUCCEED', 'SAVE_QUOTE_EDIT_FAIL',
  'RESTORE_QUOTE', 'RESTORE_QUOTE_SUCCEED', 'RESTORE_QUOTE_FAIL',
  'CLOSE_TRIAL_MODAL', 'OPEN_TRIAL_MODAL',
  'TRIAL_QUOTE', 'TRIAL_QUOTE_SUCCEED', 'TRIAL_QUOTE_FAIL',
  'RELOAD_QUOTE_FEES',
]);

const initialState = {
  partners: [],
  quoteNo: '',
  quoteData: {},
  quoteFees: [],
  quoteSaving: false,
  quoteRevisions: [],
  quotesList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    sortField: '',
    sortOrder: '',
    viewStatus: 'clientQuote',
  },
  quotesLoading: false,
  quoteFeesLoading: false,
  visibleCreateModal: false,
  publishModalVisible: false,
  trialModalVisible: false,
  trialBegin: false,
  visibleAddFeeModal: false,
  quoteFeesReload: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.VISIBLE_QUOTE_CREATE_MODAL:
      return { ...state, visibleCreateModal: action.data };
    case actionTypes.QUOTES_LOAD:
      return {
        ...state,
        quoteFeesReload: false,
        quotesList: { ...state.quotesList, quotesLoading: false },
        listFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.QUOTES_LOAD_SUCCEED:
      return {
        ...state,
        quotesList: { ...state.quotesList, ...action.result.data, quotesLoading: false },
      };
    case actionTypes.QUOTE_PARAMS_LOAD:
      return { ...state, quoteNo: action.params.quoteNo };
    case actionTypes.QUOTE_PARAMS_LOAD_SUCCEED:
      return { ...state, quoteData: action.result.data };
    case actionTypes.QUOTE_FEES_LOAD:
      return { ...state, quoteFeesLoading: true };
    case actionTypes.QUOTE_FEES_LOAD_SUCCEED:
      return { ...state, quoteFeesLoading: false, quoteFees: action.result.data };
    case actionTypes.REVISE_QUOTE_SETTING:
      return { ...state, quoteSaving: true };
    case actionTypes.REVISE_QUOTE_SETTING_FAIL:
      return { ...state, quoteSaving: false };
    case actionTypes.REVISE_QUOTE_SETTING_SUCCEED:
      return { ...state, quoteData: action.data, quoteSaving: false };
    // case actionTypes.QUOTE_COPY:
    //   return { ...state, quoteData: { ...state.quoteData, loading: true } };
    // case actionTypes.QUOTE_COPY_SUCCEED:
    //   return { ...state, quoteData: { ...action.result.data.quoteData, loading: false } };
    case actionTypes.OPEN_PUBLISH_MODAL:
      return { ...state, publishModalVisible: true };
    case actionTypes.CLOSE_PUBLISH_MODAL:
      return { ...state, publishModalVisible: false };
    case actionTypes.OPEN_TRIAL_MODAL:
      return { ...state, trialModalVisible: true };
    case actionTypes.CLOSE_TRIAL_MODAL:
      return { ...state, trialModalVisible: false };
    case actionTypes.TRIAL_QUOTE:
      return { ...state, trialBegin: true };
    case actionTypes.TRIAL_QUOTE_SUCCEED:
    case actionTypes.TRIAL_QUOTE_FAIL:
      return { ...state, trialBegin: false };
    case actionTypes.RELOAD_QUOTE_FEES:
      return { ...state, quoteFeesReload: true };
    default:
      return state;
  }
}

export function toggleQuoteCreateModal(visible) {
  return {
    type: actionTypes.VISIBLE_QUOTE_CREATE_MODAL,
    data: visible,
  };
}

export function reloadQuoteFees() {
  return {
    type: actionTypes.RELOAD_QUOTE_FEES,
  };
}

export function saveQuoteBatchEdit(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_QUOTE_EDIT,
        actionTypes.SAVE_QUOTE_EDIT_SUCCEED,
        actionTypes.SAVE_QUOTE_EDIT_FAIL,
      ],
      endpoint: 'v1/cms/quote/saveQuoteEdit',
      method: 'post',
      data: params,
      origin: 'mongo',
    },
  };
}

export function loadQtModelbyTenantId(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTE_MODELBY_LOAD,
        actionTypes.QUOTE_MODELBY_LOAD_SUCCEED,
        actionTypes.QUOTE_MODELBY_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/quote/loadModel/byTenantId',
      method: 'get',
      params: { tenantId },
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
    },
  };
}

export function loadQuoteTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTES_LOAD,
        actionTypes.QUOTES_LOAD_SUCCEED,
        actionTypes.QUOTES_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/quote/load',
      method: 'get',
      params,
    },
  };
}

export function loadQuoteParams(quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTE_PARAMS_LOAD,
        actionTypes.QUOTE_PARAMS_LOAD_SUCCEED,
        actionTypes.QUOTE_PARAMS_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/quote/params',
      method: 'get',
      params: { quoteNo },
    },
  };
}

export function loadQuoteFees(quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTE_FEES_LOAD,
        actionTypes.QUOTE_FEES_LOAD_SUCCEED,
        actionTypes.QUOTE_FEES_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/quote/fees',
      method: 'get',
      params: { quoteNo },
    },
  };
}

export function reviseQuoteSetting(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REVISE_QUOTE_SETTING,
        actionTypes.REVISE_QUOTE_SETTING_SUCCEED,
        actionTypes.REVISE_QUOTE_SETTING_FAIL,
      ],
      endpoint: 'v1/cms/quote/setting/revise',
      method: 'post',
      data,
    },
  };
}

export function publishQuote(quote, loginName, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PUBLISH_QUOTE,
        actionTypes.PUBLISH_QUOTE_SUCCEED,
        actionTypes.PUBLISH_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/publish',
      method: 'post',
      data: { quote, loginName, loginId },
      origin: 'mongo',
    },
  };
}

export function openPublishModal() {
  return {
    type: actionTypes.OPEN_PUBLISH_MODAL,
  };
}

export function closePublishModal() {
  return {
    type: actionTypes.CLOSE_PUBLISH_MODAL,
  };
}

export function copyQuote(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTE_COPY,
        actionTypes.QUOTE_COPY_SUCCEED,
        actionTypes.QUOTE_COPY_FAIL,
      ],
      endpoint: 'v1/cms/quote/quoteCopy',
      method: 'post',
      data: params,
      origin: 'mongo',
    },
  };
}

export function deleteQuotes(quoteNos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTES_DELETE,
        actionTypes.QUOTES_DELETE_SUCCEED,
        actionTypes.QUOTES_DELETE_FAIL,
      ],
      endpoint: 'v1/cms/quote/batch/delete',
      method: 'post',
      data: { quoteNos },
    },
  };
}

export function updateFee(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FEE_UPDATE,
        actionTypes.FEE_UPDATE_SUCCEED,
        actionTypes.FEE_UPDATE_FAIL,
      ],
      endpoint: 'v1/cms/quote/fee/update',
      method: 'post',
      data,
    },
  };
}

export function addFees(feeCodes, quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FEES_ADD,
        actionTypes.FEES_ADD_SUCCEED,
        actionTypes.FEES_ADD_FAIL,
      ],
      endpoint: 'v1/cms/quote/fees/add',
      method: 'post',
      data: { feeCodes, quoteNo },
    },
  };
}

export function deleteFees(feeCodes, quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FEES_DELETE,
        actionTypes.FEES_DELETE_SUCCEED,
        actionTypes.FEES_DELETE_FAIL,
      ],
      endpoint: 'v1/cms/quote/fees/batch/delete',
      method: 'post',
      data: { feeCodes, quoteNo },
    },
  };
}

export function restoreQuote(quoteId, quoteNo, commitMsg) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RESTORE_QUOTE,
        actionTypes.RESTORE_QUOTE_SUCCEED,
        actionTypes.RESTORE_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/restore',
      method: 'post',
      data: { quoteId, quoteNo, commitMsg },
      origin: 'mongo',
    },
  };
}

export function openTrialModal() {
  return {
    type: actionTypes.OPEN_TRIAL_MODAL,
  };
}

export function closeTrialModal() {
  return {
    type: actionTypes.CLOSE_TRIAL_MODAL,
  };
}

export function trialQuote(quoteData) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.TRIAL_QUOTE,
        actionTypes.TRIAL_QUOTE_SUCCEED,
        actionTypes.TRIAL_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/trial',
      method: 'post',
      data: quoteData,
    },
  };
}
