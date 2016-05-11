import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';
import {
  isFormDataLoadedC, appendFormAcitonTypes, formReducer,
  assignFormC, clearFormC, setFormValueC
} from 'reusable/domains/redux/form-common';

const actionTypes = createActionTypes('@@welogix/transport/shipment/', [
  'SET_CONSIGN_FIELDS', 'SAVE_LOCAL_GOODS', 'EDIT_LOCAL_GOODS',
  'REM_LOCAL_GOODS', 'SHOW_PREVIWER',
  'LOAD_FORMREQUIRE', 'LOAD_FORMREQUIRE_FAIL', 'LOAD_FORMREQUIRE_SUCCEED',
  'EDIT_SHIPMENT', 'EDIT_SHIPMENT_FAIL', 'EDIT_SHIPMENT_SUCCEED',
  'LOAD_FORM', 'LOAD_FORM_SUCCEED', 'LOAD_FORM_FAIL',
]);
appendFormAcitonTypes('@@welogix/transport/shipment/', actionTypes);

const initialState = {
  formRequire: {
    consignerLocations: [],
    consigneeLocations: [],
    transitModes: [],
    vehicleTypes: [],
    vehicleLengths: [],
    goodsTypes: [],
    packagings: [],
    clients: []
  },
  formData: {
    key: null,
    shipmt_no: '',
    freight_charge: 0.0,
    transit_time: 0,
    goodslist: [],
  },
  previewer: {
    visible: false,
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_FORMREQUIRE:
      return { ...state, formData: initialState.formData };
    case actionTypes.LOAD_FORMREQUIRE_SUCCEED:
      return { ...state, formRequire: {...action.result.data} };
    case actionTypes.SET_CONSIGN_FIELDS:
      return { ...state, formData: { ...state.formData, ...action.data }};
    case actionTypes.SAVE_LOCAL_GOODS:
      return { ...state, formData: { ...state.formData,
        goodslist: [...state.formData.goodslist, action.data.goods] }};
    case actionTypes.EDIT_LOCAL_GOODS: {
      const goodslist = [...state.formData.goodslist];
      goodslist[action.data.index] = action.data.goods;
      return { ...state, formData: { ...state.formData, goodslist }};
    }
    case actionTypes.REM_LOCAL_GOODS: {
      const goodslist = [...state.formData.goodslist];
      goodslist.splice(action.data.index, 1);
      return { ...state, formData: { ...state.formData, goodslist }};
    }
    case actionTypes.SHOW_PREVIWER: {
      return { ...state, previewer: { ...state.previewer, visible: true }};
    }
    default:
      return formReducer(actionTypes, state, action, { key: null }, 'shipmentlist')
             || state;
  }
}

export function loadFormRequire(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FORMREQUIRE,
        actionTypes.LOAD_FORMREQUIRE_SUCCEED,
        actionTypes.LOAD_FORMREQUIRE_FAIL
      ],
      endpoint: 'v1/transport/shipment/requires',
      method: 'get',
      params: { tenantId },
      cookie
    }
  };
}

export function loadForm(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FORM,
        actionTypes.LOAD_FORM_SUCCEED,
        actionTypes.LOAD_FORM_FAIL,
      ],
      endpoint: 'v1/transport/shipment',
      method: 'get',
      params,
      cookie
    }
  };
}

export function setConsignFields(data) {
  return {
    type: actionTypes.SET_CONSIGN_FIELDS,
    data
  };
}

export function saveLocalGoods(goods) {
  return {
    type: actionTypes.SAVE_LOCAL_GOODS,
    data: { goods },
  };
}

export function editLocalGoods(goods, index) {
  return {
    type: actionTypes.EDIT_LOCAL_GOODS,
    data: { goods, index },
  };
}

export function removeLocalGoods(index) {
  return {
    type: actionTypes.REM_LOCAL_GOODS,
    data: { index },
  };
}

export function isFormDataLoaded(shipmentState, shipmentId) {
  return isFormDataLoadedC(shipmentId, shipmentState, 'shipmentlist');
}

export function assignForm(shipmentState, shipmentId) {
  return assignFormC(shipmentId, shipmentState, 'shipmentlist', actionTypes);
}

export function setFormValue(field, value) {
  return setFormValueC(actionTypes, field, value);
}

export function clearForm() {
  return clearFormC(actionTypes);
}

export function showPreviewer() {
  return {
    type: actionTypes.SHOW_PREVIWER,
  };
}
