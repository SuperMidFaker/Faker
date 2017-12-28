import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/permit/', [
  'ADD_PERMIT', 'ADD_PERMIT_SUCCEED', 'ADD_PERMIT_FAIL',
  'LOAD_PERMITS', 'LOAD_PERMITS_SUCCEED', 'LOAD_PERMITS_FAIL',
  'LOAD_CERT_PARAMS', 'LOAD_CERT_PARAMS_SUCCEED', 'LOAD_CERT_PARAMS_FAIL',
  'LOAD_PERMIT', 'LOAD_PERMIT_SUCCEED', 'LOAD_PERMIT_FAIL',
  'UPDATE_PERMIT', 'UPDATE_PERMIT_SUCCEED', 'UPDATE_PERMIT_FAIL',
  'TOGGLE_PERMIT_ITEM_MODAL', 'TOGGLE_TRADE_ITEM_MODAL',
  'ADD_PERMIT_MODEL', 'ADD_PERMIT_MODEL_SUCCEED', 'ADD_PERMIT_MODEL_FAIL',
  'LOAD_PERMIT_MODELS', 'LOAD_PERMIT_MODELS_SUCCEED', 'LOAD_PERMIT_MODELS_FAIL',
]);

const initialState = {
  permitList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
    loading: true,
  },
  permitFilter: {
    status: 'all',
  },
  certParams: [],
  permitItemModal: {
    visible: false,
  },
  permitItems: [],
  tradeItemModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PERMITS:
      return { ...state, permitList: { ...state.permitList, loading: true } };
    case actionTypes.LOAD_PERMITS_SUCCEED:
      return {
        ...state,
        permitList: {
          ...state.permitList,
          loading: false,
          data: action.result.data.data,
        },
      };
    case actionTypes.LOAD_PERMITS_FAIL:
      return { ...state, permitList: { ...state.permitList, loading: false } };
    case actionTypes.LOAD_CERT_PARAMS_SUCCEED:
      return { ...state, certParams: action.result.data };
    case actionTypes.TOGGLE_PERMIT_ITEM_MODAL:
      return { ...state, permitItemModal: { ...state.permitItemModal, visible: action.visible } };
    case actionTypes.LOAD_PERMIT_MODELS_SUCCEED:
      return { ...state, permitItems: action.result.data };
    case actionTypes.TOGGLE_TRADE_ITEM_MODAL:
      return { ...state, tradeItemModal: { ...state.tradeItemModal, visible: action.visible } };
    default:
      return state;
  }
}

export function addPermit(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PERMIT,
        actionTypes.ADD_PERMIT_SUCCEED,
        actionTypes.ADD_PERMIT_FAIL,
      ],
      endpoint: 'v1/cms/permit/add',
      method: 'post',
      data,
    },
  };
}

export function loadPermits({ pageSize, current, filters = {} }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PERMITS,
        actionTypes.LOAD_PERMITS_SUCCEED,
        actionTypes.LOAD_PERMITS_FAIL,
      ],
      endpoint: 'v1/cms/permits/load',
      method: 'get',
      params: { pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function loadCertParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CERT_PARAMS,
        actionTypes.LOAD_CERT_PARAMS_SUCCEED,
        actionTypes.LOAD_CERT_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/cert/params/load',
      method: 'get',
    },
  };
}

export function loadPermit(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PERMIT,
        actionTypes.LOAD_PERMIT_SUCCEED,
        actionTypes.LOAD_PERMIT_FAIL,
      ],
      endpoint: 'v1/cms/permit/load',
      method: 'get',
      params: { id },
    },
  };
}

export function updatePermit(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_PERMIT,
        actionTypes.UPDATE_PERMIT_SUCCEED,
        actionTypes.UPDATE_PERMIT_FAIL,
      ],
      endpoint: 'v1/cms/permit/update',
      method: 'post',
      data,
    },
  };
}

export function togglePermitItemModal(visible) {
  return {
    type: actionTypes.TOGGLE_PERMIT_ITEM_MODAL,
    visible,
  };
}

export function addPermitModel(permitId, model) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PERMIT_MODEL,
        actionTypes.ADD_PERMIT_MODEL_SUCCEED,
        actionTypes.ADD_PERMIT_MODEL_FAIL,
      ],
      endpoint: 'v1/cms/permit/model/add',
      method: 'post',
      data: { permitId, model },
    },
  };
}

export function loadPermitModels(permitId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PERMIT_MODELS,
        actionTypes.LOAD_PERMIT_MODELS_SUCCEED,
        actionTypes.LOAD_PERMIT_MODELS_FAIL,
      ],
      endpoint: 'v1/cms/permit/models/load',
      method: 'get',
      params: { permitId },
    },
  };
}

export function toggleTradeItemModal(visible) {
  return {
    type: actionTypes.TOGGLE_TRADE_ITEM_MODAL,
    visible,
  };
}
