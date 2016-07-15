import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import {
  isFormDataLoadedC, appendFormAcitonTypes, formReducer,
  assignFormC, clearFormC, setFormValueC,
} from './form-common';
import { LOAD_APTSHIPMENT_SUCCEED } from './transport-acceptance';
import { LOAD_TRANSHIPMT_SUCCEED } from './trackingLandStatus';

const actionTypes = createActionTypes('@@welogix/transport/shipment/', [
  'SET_CONSIGN_FIELDS', 'SAVE_LOCAL_GOODS', 'EDIT_LOCAL_GOODS',
  'REM_LOCAL_GOODS', 'SHOW_PREVIWER', 'HIDE_PREVIWER',
  'LOAD_FORMREQUIRE', 'LOAD_FORMREQUIRE_FAIL', 'LOAD_FORMREQUIRE_SUCCEED',
  'EDIT_SHIPMENT', 'EDIT_SHIPMENT_FAIL', 'EDIT_SHIPMENT_SUCCEED',
  'LOAD_FORM', 'LOAD_FORM_SUCCEED', 'LOAD_FORM_FAIL',
  'LOAD_DRAFTFORM', 'LOAD_DRAFTFORM_SUCCEED', 'LOAD_DRAFTFORM_FAIL',
  'LOAD_DETAIL', 'LOAD_DETAIL_SUCCEED', 'LOAD_DETAIL_FAIL',
  'LOAD_PUB_DETAIL', 'LOAD_PUB_DETAIL_SUCCEED', 'LOAD_PUB_DETAIL_FAIL',
  'SEND_SMS_MESSAGE', 'SEND_SMS_MESSAGE_SUCCEED', 'SEND_SMS_MESSAGE_FAIL',
  'SHIPMENT_STATISTICS', 'SHIPMENT_STATISTICS_SUCCEED', 'SHIPMENT_STATISTICS_FAIL',
]);
appendFormAcitonTypes('@@welogix/transport/shipment/', actionTypes);
const startDate = new Date();
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0);
const endDate = new Date();
endDate.setDate(endDate.getDate() + 1);
endDate.setHours(0);
endDate.setMinutes(0);
endDate.setSeconds(0);
const initialState = {
  formRequire: {
    consignerLocations: [],
    consigneeLocations: [],
    transitModes: [],
    vehicleTypes: [],
    vehicleLengths: [],
    goodsTypes: [],
    packagings: [],
    containerPackagings: [],
    clients: [],
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
    tabKey: null,
    shipmt: {
      goodslist: [],
    },
    tracking: {
    },
    charges: {
    },
  },
  shipmtDetail: {
    shipmt: {},
    tracking: {
      points: [],
    },
  },
  statistics: {
    points: [],
    count: [0, 0, 0, 0, 0],
    startDate,
    endDate,
  },
};

function transformJsonDate(val) {
  // Date类型在JSON stringify/parse以后仍然是string类型,先转换
  return typeof val === 'string' ? new Date(val) : val;
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_APTSHIPMENT_SUCCEED:
    case LOAD_TRANSHIPMT_SUCCEED:
      return { ...state, previewer: { ...state.previewer, visible: false } };
    case actionTypes.LOAD_FORMREQUIRE:
      // force formData change to rerender after formrequire load
      return { ...state, formData: { goodslist: [] } };
    case actionTypes.LOAD_FORMREQUIRE_SUCCEED:
      return { ...state, formRequire: action.result.data, formData: { ...initialState.formData, ...state.formData } };
    case actionTypes.SET_CONSIGN_FIELDS:
      return { ...state, formData: { ...state.formData, ...action.data } };
    case actionTypes.SAVE_LOCAL_GOODS:
      return { ...state, formData: { ...state.formData,
        goodslist: [...state.formData.goodslist, action.data.goods] } };
    case actionTypes.EDIT_LOCAL_GOODS: {
      const goodslist = [...state.formData.goodslist];
      goodslist[action.data.index] = action.data.goods;
      return { ...state, formData: { ...state.formData, goodslist } };
    }
    case actionTypes.REM_LOCAL_GOODS: {
      const goodslist = [...state.formData.goodslist];
      const originalRemovedGoodsIds = state.formData.removedGoodsIds ? state.formData.removedGoodsIds : [];
      const removedGoodsIds = [...originalRemovedGoodsIds, ...goodslist.splice(action.data.index, 1).map(goods => goods.id)];
      return { ...state, formData: { ...state.formData, goodslist, removedGoodsIds } };
    }
    case actionTypes.LOAD_FORM:
      return { ...state, formData: initialState.formData };
    case actionTypes.LOAD_FORM_SUCCEED: {
      const formData = action.result.data.formData;
      return { ...state, formData: { ...state.formData, ...formData,
        pickup_est_date: transformJsonDate(formData.pickup_est_date),
        deliver_est_date: transformJsonDate(formData.deliver_est_date),
      } };
    }
    case actionTypes.LOAD_DRAFTFORM:
      return { ...state, formData: initialState.formData };
    case actionTypes.LOAD_DRAFTFORM_SUCCEED:
      return { ...state, formData: {
        ...state.formData, ...action.result.data.shipmt,
        pickup_est_date: transformJsonDate(action.result.data.shipmt.pickup_est_date),
        deliver_est_date: transformJsonDate(action.result.data.shipmt.deliver_est_date),
        goodslist: action.result.data.goodslist,
      } };
    case actionTypes.LOAD_DETAIL_SUCCEED: {
      return { ...state, previewer: {
        shipmt: action.result.data.shipmt,
        tracking: action.result.data.tracking,
        charges: action.result.data.charges,
        visible: true,
        tabKey: action.tabKey,
      } };
    }
    case actionTypes.HIDE_PREVIWER: {
      return { ...state, previewer: { ...state.previewer, visible: false } };
    }
    case actionTypes.LOAD_PUB_DETAIL_SUCCEED: {
      return { ...state, shipmtDetail: action.result.data };
    }
    case actionTypes.SEND_SMS_MESSAGE_SUCCEED: {
      return { ...state };
    }
    case actionTypes.SHIPMENT_STATISTICS_SUCCEED: {
      return { ...state, statistics: action.result.data };
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
        actionTypes.LOAD_FORMREQUIRE_FAIL,
      ],
      endpoint: 'v1/transport/shipment/requires',
      method: 'get',
      params: { tenantId },
      cookie,
    },
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
      cookie,
    },
  };
}

export function loadDraftForm(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DRAFTFORM,
        actionTypes.LOAD_DRAFTFORM_SUCCEED,
        actionTypes.LOAD_DRAFTFORM_FAIL,
      ],
      endpoint: 'v1/transport/shipment/draft',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function setConsignFields(data) {
  return {
    type: actionTypes.SET_CONSIGN_FIELDS,
    data,
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

export function loadShipmtDetail(shipmtNo, tenantId, sourceType, tabKey) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DETAIL,
        actionTypes.LOAD_DETAIL_SUCCEED,
        actionTypes.LOAD_DETAIL_FAIL,
      ],
      endpoint: 'v1/transport/shipment/detail',
      method: 'get',
      params: { shipmtNo, tenantId, sourceType },
      tabKey,
    },
  };
}

export function hidePreviewer() {
  return {
    type: actionTypes.HIDE_PREVIWER,
  };
}

export function loadPubShipmtDetail(shipmtNo, key) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PUB_DETAIL,
        actionTypes.LOAD_PUB_DETAIL_SUCCEED,
        actionTypes.LOAD_PUB_DETAIL_FAIL,
      ],
      endpoint: 'public/v1/transport/shipment/detail',
      method: 'get',
      params: { shipmtNo, key },
    },
  };
}

export function sendTrackingDetailSMSMessage(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_SMS_MESSAGE,
        actionTypes.SEND_SMS_MESSAGE_SUCCEED,
        actionTypes.SEND_SMS_MESSAGE_FAIL,
      ],
      endpoint: 'v1/transport/shipment/sendTrackingDetailSMSMessage',
      method: 'post',
      data,
    },
  };
}

export function loadShipmentStatistics(cookie, tenantId, sDate, eDate) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHIPMENT_STATISTICS,
        actionTypes.SHIPMENT_STATISTICS_SUCCEED,
        actionTypes.SHIPMENT_STATISTICS_FAIL,
      ],
      endpoint: 'v1/transport/shipment/statistics',
      method: 'get',
      cookie,
      params: { tenantId, startDate: sDate, endDate: eDate },
    },
  };
}
