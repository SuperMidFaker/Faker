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
  'LOAD_TRADE_ITEMS', 'LOAD_TRADE_ITEMS_SUCCEED', 'LOAD_TRADE_ITEMS_FAIL',
  'ADD_PERMIT_TRADE_ITEMS', 'ADD_PERMIT_TRADE_ITEMS_SUCCEED', 'ADD_PERMIT_TRADE_ITEMS_FAIL',
  'AUTOMATIC_MATCH', 'AUTOMATIC_MATCH_SUCCESS', 'AUTOMATIC_MATCH_FAIL',
  'LOAD_PERMITS_BY_TRADE_ITEM', 'LOAD_PERMITS_BY_TRADE_ITEM_SUCCEED', 'LOAD_PERMITS_BY_TRADE_ITEM_FAIL',
  'TOGGLE_ITEM_MANAGE_MODAL',
  'LOAD_MODEL_ITEMS', 'LOAD_MODEL_ITEMS_SUCCEED', 'LOAD_MODEL_ITEMS_FAIL',
  'DELETE_MODEL_ITEM', 'DELETE_MODEL_ITEM_SUCCEED', 'DELETE_MODEL_ITEM_FAIL',
]);

const initialState = {
  permitList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
    loading: true,
  },
  tradeItemList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
    loading: false,
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
    modelId: '',
  },
  currentPermit: {},
  itemManageModal: {
    visible: false,
    productNos: '',
    modelId: '',
  },
  modelItems: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
    loading: false,
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
          loading: false,
          ...action.result.data,
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
      return {
        ...state,
        tradeItemModal: {
          ...state.tradeItemModal,
          visible: action.visible,
          modelId: action.modelId,
        },
      };
    case actionTypes.LOAD_PERMIT_SUCCEED:
      return { ...state, currentPermit: action.result.data };
    case actionTypes.LOAD_TRADE_ITEMS:
      return { ...state, tradeItemList: { ...state.tradeItemList, loading: true } };
    case actionTypes.LOAD_TRADE_ITEMS_SUCCEED:
      return { ...state, tradeItemList: { ...action.result.data, loading: false } };
    case actionTypes.LOAD_TRADE_ITEMS_FAIL:
      return { ...state, tradeItemList: { ...state.tradeItemList, loading: false } };
    case actionTypes.TOGGLE_ITEM_MANAGE_MODAL:
      return {
        ...state,
        itemManageModal: {
          ...state.itemManageModal,
          visible: action.visible,
          productNos: action.productNos,
          modelId: action.modelId,
        },
      };
    case actionTypes.LOAD_MODEL_ITEMS:
      return { ...state, modelItems: { ...state.modelItems, loading: true } };
    case actionTypes.LOAD_MODEL_ITEMS_SUCCEED:
      return {
        ...state,
        modelItems: {
          loading: false,
          ...action.result.data,
        },
      };
    case actionTypes.LOAD_MODEL_ITEMS_FAIL:
      return { ...state, modelItems: { ...state.modelItems, loading: false } };
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

export function toggleTradeItemModal(visible, modelId) {
  return {
    type: actionTypes.TOGGLE_TRADE_ITEM_MODAL,
    visible,
    modelId,
  };
}

export function loadTradeItems(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRADE_ITEMS,
        actionTypes.LOAD_TRADE_ITEMS_SUCCEED,
        actionTypes.LOAD_TRADE_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/trade/items/load',
      method: 'get',
      params,
    },
  };
}

export function addPermitTradeItem(modelId, tradeItems) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PERMIT_TRADE_ITEMS,
        actionTypes.ADD_PERMIT_TRADE_ITEMS_SUCCEED,
        actionTypes.ADD_PERMIT_TRADE_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/permit/trade/items/add',
      method: 'post',
      data: { modelId, tradeItems },
    },
  };
}

export function automaticMatch(modelId, model, ownerPartnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.AUTOMATIC_MATCH,
        actionTypes.AUTOMATIC_MATCH_SUCCESS,
        actionTypes.AUTOMATIC_MATCH_FAIL,
      ],
      endpoint: 'v1/cms/permit/automatic/match',
      method: 'post',
      data: { modelId, model, ownerPartnerId },
    },
  };
}

export function loadPermitsByTradeItem(tradeItemId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PERMITS_BY_TRADE_ITEM,
        actionTypes.LOAD_PERMITS_BY_TRADE_ITEM_SUCCEED,
        actionTypes.LOAD_PERMITS_BY_TRADE_ITEM_FAIL,
      ],
      endpoint: 'v1/cms/permits/load/by/trade/item',
      method: 'get',
      params: { tradeItemId },
    },
  };
}

export function toggleItemManageModal(visible, productNos, modelId) {
  return {
    type: actionTypes.TOGGLE_ITEM_MANAGE_MODAL,
    visible,
    productNos,
    modelId,
  };
}

export function loadModelItems({
  productNos, ownerPartnerId, pageSize, current,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MODEL_ITEMS,
        actionTypes.LOAD_MODEL_ITEMS_SUCCEED,
        actionTypes.LOAD_MODEL_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/model/items/load',
      method: 'get',
      params: {
        productNos, ownerPartnerId, pageSize, current,
      },
    },
  };
}

export function deleteModelItem(modelId, productNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_MODEL_ITEM,
        actionTypes.DELETE_MODEL_ITEM_SUCCEED,
        actionTypes.DELETE_MODEL_ITEM_FAIL,
      ],
      endpoint: 'v1/cms/model/item/delete',
      method: 'post',
      data: { modelId, productNo },
    },
  };
}
