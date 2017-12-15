import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/sku/', [
  'SET_OWNER', 'SET_FORM', 'CLEAN_FORM',
  'LOAD_OWNERSKUS', 'LOAD_OWNERSKUS_SUCCEED', 'LOAD_OWNERSKUS_FAIL',
  'LOAD_SKUPARAMS', 'LOAD_SKUPARAMS_SUCCEED', 'LOAD_SKUPARAMS_FAIL',
  'SYNC_TRADESKU', 'SYNC_TRADESKU_SUCCEED', 'SYNC_TRADESKU_FAIL',
  'NEW_SKU', 'NEW_SKU_SUCCEED', 'NEW_SKU_FAIL',
  'DEL_SKU', 'DEL_SKU_SUCCEED', 'DEL_SKU_FAIL',
  'LOAD_SKU', 'LOAD_SKU_SUCCEED', 'LOAD_SKU_FAIL',
  'SAVE_SKU', 'SAVE_SKU_SUCCEED', 'SAVE_SKU_FAIL',
  'OPEN_PACKING_RULE_MODAL', 'CLOSE_PACKING_RULE_MODAL',
  'OPEN_APPLY_PACKING_RULE_MODAL', 'CLOSE_APPLY_PACKING_RULE_MODAL',
  'SAVE_SKU_TEMPLATE', 'SAVE_SKU_TEMPLATE_SUCCEED', 'SAVE_SKU_TEMPLATE_FAIL',
  'LOAD_SKU_RULE', 'LOAD_SKU_RULE_SUCCEED', 'LOAD_SKU_RULE_FAIL',
]);

const initialState = {
  loading: false,
  skuSyncing: false,
  skuSubmitting: false,
  owner: {},
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    sku: '',
  },
  params: {
    units: [],
    currencies: [],
    packings: [],
  },
  skuForm: {
    product_default: true,
    currency: '142', // RMB
    asn_tag_unit: 'primary',
    so_tag_unit: 'primary',
    variants: [],
    unit: '007',
    unit_name: '个',
    sku_pack_unit: '00',
    sku_pack_qty: 1,
    inbound_convey: 'PCS',
    outbound_convey: 'PCS',
  },
  skuRule: {},
  packingRuleModal: {
    visible: false,
  },
  applyPackingRuleModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_OWNER:
      return { ...state, owner: action.data };
    case actionTypes.LOAD_OWNERSKUS:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true,
      };
    case actionTypes.LOAD_OWNERSKUS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_OWNERSKUS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_SKUPARAMS_SUCCEED:
      return { ...state, params: action.result.data };
    case actionTypes.SET_FORM:
      return { ...state, skuForm: { ...state.skuForm, ...action.data } };
    case actionTypes.CLEAN_FORM:
      return { ...state, skuForm: initialState.skuForm };
    case actionTypes.NEW_SKU:
      return { ...state, skuSubmitting: true };
    case actionTypes.NEW_SKU_SUCCEED:
    case actionTypes.NEW_SKU_FAIL:
      return { ...state, skuSubmitting: false };
    case actionTypes.SYNC_TRADESKU:
      return { ...state, skuSyncing: true, loading: true };
    case actionTypes.SYNC_TRADESKU_SUCCEED:
      return { ...state, skuSyncing: false };
    case actionTypes.SYNC_TRADESKU_FAIL:
      return { ...state, skuSyncing: false, loading: false };
    case actionTypes.LOAD_SKU_SUCCEED:
      return { ...state, skuForm: action.result.data };
    case actionTypes.OPEN_PACKING_RULE_MODAL:
      return { ...state, packingRuleModal: { visible: true } };
    case actionTypes.CLOSE_PACKING_RULE_MODAL:
      return { ...state, packingRuleModal: { visible: false } };
    case actionTypes.OPEN_APPLY_PACKING_RULE_MODAL:
      return { ...state, applyPackingRuleModal: { visible: true } };
    case actionTypes.CLOSE_APPLY_PACKING_RULE_MODAL:
      return { ...state, applyPackingRuleModal: { visible: false } };
    case actionTypes.LOAD_SKU_RULE_SUCCEED:
      return { ...state, skuRule: { ...action.result.data } };
    default:
      return state;
  }
}

export function setCurrentOwner(owner) {
  return {
    type: actionTypes.SET_OWNER,
    data: owner,
  };
}

export function loadSkuParams(ownerPartnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SKUPARAMS,
        actionTypes.LOAD_SKUPARAMS_SUCCEED,
        actionTypes.LOAD_SKUPARAMS_FAIL,
      ],
      endpoint: 'v1/cwm/sku/params',
      method: 'get',
      params: { owner_partner_id: ownerPartnerId },
    },
  };
}

export function loadOwnerSkus(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OWNERSKUS,
        actionTypes.LOAD_OWNERSKUS_SUCCEED,
        actionTypes.LOAD_OWNERSKUS_FAIL,
      ],
      endpoint: 'v1/cwm/whse/owner/skus',
      method: 'get',
      params,
    },
  };
}

export function setSkuForm(newform) {
  return {
    type: actionTypes.SET_FORM,
    data: newform,
  };
}

export function cleanSkuForm() {
  return {
    type: actionTypes.CLEAN_FORM,
  };
}

export function openPackingRuleModal() {
  return {
    type: actionTypes.OPEN_PACKING_RULE_MODAL,
  };
}

export function closePackingRuleModal() {
  return {
    type: actionTypes.CLOSE_PACKING_RULE_MODAL,
  };
}

export function openApplyPackingRuleModal() {
  return {
    type: actionTypes.OPEN_APPLY_PACKING_RULE_MODAL,
  };
}

export function closeApplyPackingRuleModal() {
  return {
    type: actionTypes.CLOSE_APPLY_PACKING_RULE_MODAL,
  };
}

export function syncTradeItemSkus(ownerPartnerId, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SYNC_TRADESKU,
        actionTypes.SYNC_TRADESKU_SUCCEED,
        actionTypes.SYNC_TRADESKU_FAIL,
      ],
      endpoint: 'v1/cwm/product/sync/tradeitem/skus',
      method: 'post',
      data: { ownerPartnerId, loginId },
    },
  };
}

export function createSku(formData) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.NEW_SKU,
        actionTypes.NEW_SKU_SUCCEED,
        actionTypes.NEW_SKU_FAIL,
      ],
      endpoint: 'v1/cwm/product/create/sku',
      method: 'post',
      data: formData,
    },
  };
}

export function delSku(sku) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_SKU,
        actionTypes.DEL_SKU_SUCCEED,
        actionTypes.DEL_SKU_FAIL,
      ],
      endpoint: 'v1/cwm/product/del/sku',
      method: 'post',
      data: { sku },
    },
  };
}

export function loadSku(sku) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SKU,
        actionTypes.LOAD_SKU_SUCCEED,
        actionTypes.LOAD_SKU_FAIL,
      ],
      endpoint: 'v1/cwm/product/sku',
      method: 'get',
      params: { sku },
    },
  };
}

export function saveSku(formData) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_SKU,
        actionTypes.SAVE_SKU_SUCCEED,
        actionTypes.SAVE_SKU_FAIL,
      ],
      endpoint: 'v1/cwm/product/save/sku',
      method: 'post',
      data: formData,
    },
  };
}

export function saveSkuTemplate(data, loginId, partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_SKU_TEMPLATE,
        actionTypes.SAVE_SKU_TEMPLATE_SUCCEED,
        actionTypes.SAVE_SKU_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cwm/product/save/sku/template',
      method: 'post',
      data: { data, loginId, partnerId },
    },
  };
}

export function loadSkuRule(ownerPartnerId, productSku) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SKU_RULE,
        actionTypes.LOAD_SKU_RULE_SUCCEED,
        actionTypes.LOAD_SKU_RULE_FAIL,
      ],
      endpoint: 'v1/cwm/sku/rule/load',
      method: 'get',
      params: { ownerPartnerId, productSku },
    },
  };
}
