import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'QUOTE_MODEL_LOAD', 'QUOTE_MODEL_LOAD_SUCCEED', 'QUOTE_MODEL_LOAD_FAIL',
  'CREATE_QUOTE', 'CREATE_QUOTE_SUCCEED', 'CREATE_QUOTE_FAIL',
  'QUOTES_LOAD', 'QUOTES_LOAD_SUCCEED', 'QUOTES_LOAD_FAIL',
  'EDITQUOTE_LOAD', 'EDITQUOTE_LOAD_SUCCEED', 'EDITQUOTE_LOAD_FAIL',
  'QUOTE_COPY', 'QUOTE_COPY_SUCCEED', 'QUOTE_COPY_FAIL',
  'QUOTE_DELETE', 'QUOTE_DELETE_SUCCEED', 'QUOTE_DELETE_FAIL',
  'QUOTEDRAFT_DELETE', 'QUOTEDRAFT_DELETE_SUCCEED', 'QUOTEDRAFT_DELETE_FAIL',
  'FEE_ADD', 'FEE_ADD_SUCCEED', 'FEE_ADD_FAIL',
  'FEE_UPDATE', 'FEE_UPDATE_SUCCEED', 'FEE_UPDATE_FAIL',
  'FEE_DELETE', 'FEE_DELETE_SUCCEED', 'FEE_DELETE_FAIL',
  'SAVE_QUOTE_MODEL', 'SAVE_QUOTE_MODEL_SUCCEED', 'SAVE_QUOTE_MODEL_FAIL',
  'QUOTE_STATUS_UPDATE', 'QUOTE_STATUS_UPDATE_SUCCEED', 'QUOTE_STATUS_UPDATE_FAIL',
  'OPEN_CREATE_MODAL', 'CLOSE_CREATE_MODAL',
  'CREATE_DRAFTQUOTE', 'CREATE_DRAFTQUOTE_SUCCEED', 'CREATE_DRAFTQUOTE_FAIL',
  'REVISE_QUOTE', 'REVISE_QUOTE_SUCCEED', 'REVISE_QUOTE_FAIL',
  'PUBLISH_QUOTE', 'PUBLISH_QUOTE_SUCCEED', 'PUBLISH_QUOTE_FAIL',
  'CLOSE_PUBLISH_MODAL', 'OPEN_PUBLISH_MODAL',
  'SAVE_QUOTE_EDIT', 'SAVE_QUOTE_EDIT_SUCCEED', 'SAVE_QUOTE_EDIT_FAIL',
  'LOAD_QUOTEREVS', 'LOAD_QUOTEREVS_SUCCEED', 'LOAD_QUOTEREVS_FAIL',
  'RESTORE_QUOTE', 'RESTORE_QUOTE_SUCCEED', 'RESTORE_QUOTE_FAIL',
  'CLOSE_TRIAL_MODAL', 'OPEN_TRIAL_MODAL',
  'TRIAL_QUOTE', 'TRIAL_QUOTE_SUCCEED', 'TRIAL_QUOTE_FAIL',
]);

const initialState = {
  partners: [],
  quoteData: {
    _id: '',
    quote_no: '',
    decl_way_code: [],
    trans_mode: [],
    modify_name: '',
    modify_id: '',
    valid: true,
    fees: [],
  },
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
    status: 'all',
    viewStatus: 'clientQuote',
  },
  quotesLoading: false,
  visibleCreateModal: false,
  publishModalVisible: false,
  trialModalVisible: false,
  trialBegin: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_CREATE_MODAL:
      return { ...state, visibleCreateModal: true };
    case actionTypes.CLOSE_CREATE_MODAL:
      return { ...state, visibleCreateModal: false };
    case actionTypes.QUOTE_MODEL_LOAD:
      return { ...state, quoteData: { ...initialState.quoteData, loading: true } };
    case actionTypes.QUOTE_MODEL_LOAD_SUCCEED:
      return { ...state, quoteData: { ...action.result.data.quoteData, loading: false } };
    case actionTypes.QUOTES_LOAD:
      return {
        ...state,
        quotesList: { ...state.quotesList, quotesLoading: false },
        listFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.QUOTES_LOAD_SUCCEED:
      return {
        ...state,
        quotesList: { ...state.quotesList, ...action.result.data, quotesLoading: false },
      };
    case actionTypes.EDITQUOTE_LOAD_SUCCEED:
      return { ...state, quoteData: action.result.data.quoteData };
    case actionTypes.REVISE_QUOTE:
      return { ...state, quoteSaving: true };
    case actionTypes.REVISE_QUOTE_FAIL:
      return { ...state, quoteSaving: false };
    case actionTypes.REVISE_QUOTE_SUCCEED:
      return { ...state, quoteData: action.data.quote, quoteSaving: false };
    case actionTypes.QUOTE_COPY:
      return { ...state, quoteData: { ...state.quoteData, loading: true } };
    case actionTypes.QUOTE_COPY_SUCCEED:
      return { ...state, quoteData: { ...action.result.data.quoteData, loading: false } };
    case actionTypes.OPEN_PUBLISH_MODAL:
      return { ...state, publishModalVisible: true };
    case actionTypes.CLOSE_PUBLISH_MODAL:
      return { ...state, publishModalVisible: false };
    case actionTypes.LOAD_QUOTEREVS_SUCCEED:
      return { ...state, quoteRevisions: action.result.data };
    case actionTypes.OPEN_TRIAL_MODAL:
      return { ...state, trialModalVisible: true };
    case actionTypes.CLOSE_TRIAL_MODAL:
      return { ...state, trialModalVisible: false };
    case actionTypes.TRIAL_QUOTE:
      return { ...state, trialBegin: true };
    case actionTypes.TRIAL_QUOTE_SUCCEED:
    case actionTypes.TRIAL_QUOTE_FAIL:
      return { ...state, trialBegin: false };
    default:
      return state;
  }
}

export function openCreateModal() {
  return {
    type: actionTypes.OPEN_CREATE_MODAL,
  };
}
export function closeCreateModal() {
  return {
    type: actionTypes.CLOSE_CREATE_MODAL,
  };
}

export function loadQuoteModel(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTE_MODEL_LOAD,
        actionTypes.QUOTE_MODEL_LOAD_SUCCEED,
        actionTypes.QUOTE_MODEL_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/quote/loadModel',
      method: 'get',
      params: { tenantId },
      origin: 'mongo',
    },
  };
}

export function saveQuoteModel(tenantId, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_QUOTE_MODEL,
        actionTypes.SAVE_QUOTE_MODEL_SUCCEED,
        actionTypes.SAVE_QUOTE_MODEL_FAIL,
      ],
      endpoint: 'v1/cms/quote/saveModel',
      method: 'post',
      data: { tenantId, params },
      origin: 'mongo',
    },
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
      origin: 'mongo',
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
      origin: 'mongo',
    },
  };
}

export function createDraftQuote(quoteNo, loginName, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_DRAFTQUOTE,
        actionTypes.CREATE_DRAFTQUOTE_SUCCEED,
        actionTypes.CREATE_DRAFTQUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/create/draft',
      method: 'post',
      data: { quoteNo, loginName, loginId },
      origin: 'mongo',
    },
  };
}

export function loadEditQuote(quoteno, version) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDITQUOTE_LOAD,
        actionTypes.EDITQUOTE_LOAD_SUCCEED,
        actionTypes.EDITQUOTE_LOAD_FAIL,
      ],
      endpoint: `v1/cms/quote/${quoteno}/${version}`,
      method: 'get',
      origin: 'mongo',
    },
  };
}

export function reviseQuote(quote, loginName, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REVISE_QUOTE,
        actionTypes.REVISE_QUOTE_SUCCEED,
        actionTypes.REVISE_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/quote/revise',
      method: 'post',
      data: { quote, loginName, loginId },
      origin: 'mongo',
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

export function updateQuoteStatus(quoteId, valid, tenantId, modifyBy, modifyById) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTE_STATUS_UPDATE,
        actionTypes.QUOTE_STATUS_UPDATE_SUCCEED,
        actionTypes.QUOTE_STATUS_UPDATE_FAIL,
      ],
      endpoint: 'v1/cms/quote/statusUpdate',
      method: 'post',
      data: {
        quoteId, valid, tenantId, modifyBy, modifyById,
      },
      origin: 'mongo',
    },
  };
}

export function deleteQuote(quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTE_DELETE,
        actionTypes.QUOTE_DELETE_SUCCEED,
        actionTypes.QUOTE_DELETE_FAIL,
      ],
      endpoint: 'v1/cms/quote/delete',
      method: 'post',
      data: { quoteNo },
      origin: 'mongo',
    },
  };
}

export function deleteDraftQuote(quoteId, quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUOTEDRAFT_DELETE,
        actionTypes.QUOTEDRAFT_DELETE_SUCCEED,
        actionTypes.QUOTEDRAFT_DELETE_FAIL,
      ],
      endpoint: 'v1/cms/quote/draft/delete',
      method: 'post',
      data: { quoteId, quoteNo },
      origin: 'mongo',
    },
  };
}

export function feeUpdate(params, row) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FEE_UPDATE,
        actionTypes.FEE_UPDATE_SUCCEED,
        actionTypes.FEE_UPDATE_FAIL,
      ],
      endpoint: 'v1/cms/quote/feeupdate',
      method: 'post',
      data: { params, row },
      origin: 'mongo',
    },
  };
}

export function feeAdd(params, row) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FEE_ADD,
        actionTypes.FEE_ADD_SUCCEED,
        actionTypes.FEE_ADD_FAIL,
      ],
      endpoint: 'v1/cms/quote/feeadd',
      method: 'post',
      data: { params, row },
      origin: 'mongo',
    },
  };
}

export function feeDelete(params, feeId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FEE_DELETE,
        actionTypes.FEE_DELETE_SUCCEED,
        actionTypes.FEE_DELETE_FAIL,
      ],
      endpoint: 'v1/cms/quote/feedelete',
      method: 'post',
      data: { params, feeId },
      origin: 'mongo',
    },
  };
}

export function loadQuoteRevisions(quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_QUOTEREVS,
        actionTypes.LOAD_QUOTEREVS_SUCCEED,
        actionTypes.LOAD_QUOTEREVS_FAIL,
      ],
      endpoint: 'v1/cms/quote/revisons',
      method: 'get',
      params: { quoteNo },
      origin: 'mongo',
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
