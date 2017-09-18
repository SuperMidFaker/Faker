import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import {
  isFormDataLoadedC, appendFormAcitonTypes, formReducer,
  assignFormC, clearFormC, setFormValueC,
} from './form-common';
import { TARIFF_METER_METHODS } from 'common/constants';

import { REPORT_LOC_SUCCEED, LOAD_TRANSHIPMT, CHANGE_ACT_DATE_SUCCEED } from './trackingLandStatus';
import { CREATE_EXCEPTION_SUCCEED, LOAD_EXCPSHIPMT, DEAL_EXCEPTION_SUCCEED } from './trackingLandException';
import { LOAD_PODSHIPMT, SAVE_POD_SUCCEED } from './trackingLandPod';
import { LOAD_DISPSHIPMENT } from './transportDispatch';
import { LOAD_APTSHIPMENT, SAVE_EDIT_SUCCEED, REVOKE_SHIPMT_SUCCEED } from './transport-acceptance';
import { LOAD_FEES, CREATE_ADVANCE_SUCCEED, CREATE_SPECIALCHARGE_SUCCEED } from './transportBilling';
const actionTypes = createActionTypes('@@welogix/transport/shipment/', [
  'SET_CONSIGN_FIELDS', 'SAVE_LOCAL_GOODS', 'EDIT_LOCAL_GOODS',
  'REM_LOCAL_GOODS', 'SHOW_PREVIWER', 'HIDE_PREVIWER',
  'LOAD_FORMREQUIRE', 'LOAD_FORMREQUIRE_FAIL', 'LOAD_FORMREQUIRE_SUCCEED',
  'EDIT_SHIPMENT', 'EDIT_SHIPMENT_FAIL', 'EDIT_SHIPMENT_SUCCEED',
  'LOAD_FORM', 'LOAD_FORM_SUCCEED', 'LOAD_FORM_FAIL',
  'LOAD_DRAFTFORM', 'LOAD_DRAFTFORM_SUCCEED', 'LOAD_DRAFTFORM_FAIL',
  'LOAD_DETAIL', 'LOAD_DETAIL_SUCCEED', 'LOAD_DETAIL_FAIL',
  'LOAD_CHARGES', 'LOAD_CHARGES_SUCCEED', 'LOAD_CHARGES_FAIL',
  'LOAD_PUB_DETAIL', 'LOAD_PUB_DETAIL_SUCCEED', 'LOAD_PUB_DETAIL_FAIL',
  'SEND_SMS_MESSAGE', 'SEND_SMS_MESSAGE_SUCCEED', 'SEND_SMS_MESSAGE_FAIL',
  'SHIPMENT_STATISTICS', 'SHIPMENT_STATISTICS_SUCCEED', 'SHIPMENT_STATISTICS_FAIL',
  'SHIPMENT_LOGS', 'SHIPMENT_LOGS_SUCCEED', 'SHIPMENT_LOGS_FAIL',
  'SHIPMENT_SEARCH', 'SHIPMENT_SEARCH_SUCCEED', 'SHIPMENT_SEARCH_FAIL',
  'LOAD_SHIPMENT_POINTS', 'LOAD_SHIPMENT_POINTS_SUCCEED', 'LOAD_SHIPMENT_POINTS_FAIL',
  'REMOVE_SHIPMENT_POINT', 'REMOVE_SHIPMENT_POINT_SUCCEED', 'REMOVE_SHIPMENT_POINT_FAIL',
  'COMPUTE_SALECHARGE', 'COMPUTE_SALECHARGE_SUCCEED', 'COMPUTE_SALECHARGE_FAIL',
  'COMPUTE_COSTCHARGE', 'COMPUTE_COSTCHARGE_SUCCEED', 'COMPUTE_COSTCHARGE_FAIL',
  'SHOW_CHANGE_SHIPMENT_MODAL',
  'CHANGE_PREVIEWER_TAB',
  'CREATE_LOG', 'CREATE_LOG_SUCCEED', 'CREATE_LOG_FAIL',
  'UPDATE_FORM_REQUIRE_PARAMS',
  'LOAD_TARIFF_BY_TRANSPORTINFO', 'LOAD_TARIFF_BY_TRANSPORTINFO_SUCCEED', 'LOAD_TARIFF_BY_TRANSPORTINFO_FAIL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_DISPATCH_SHIPMENT', 'LOAD_DISPATCH_SHIPMENT_SUCCEED', 'LOAD_DISPATCH_SHIPMENT_FAIL',
  'PROMPT', 'PROMPT_SUCCEED', 'PROMPT_FAIL',
  'LOAD_TRANSHIPMT', 'LOAD_TRANSHIPMT_FAIL', 'LOAD_TRANSHIPMT_SUCCEED',
  'LOAD_PODSHIPMT', 'LOAD_PODSHIPMT_FAIL', 'LOAD_PODSHIPMT_SUCCEED',
  'COUNT_TOTAL', 'COUNT_TOTAL_SUCCEED', 'COUNT_TOTAL_FAIL',
  'GET_SHIPMT_ORDER_NO', 'GET_SHIPMT_ORDER_NO_SUCCEED', 'GET_SHIPMT_ORDER_NO_FAIL',
  'UPDATE_FEE', 'UPDATE_FEE_SUCCEED', 'UPDATE_FEE_FAIL',
  'TOGGLE_RECALCULATE_CHARGE',
  'LOAD_TARIFF_BY_QUOTENO', 'LOAD_TARIFF_BY_QUOTENO_SUCCEED', 'LOAD_TARIFF_BY_QUOTENO_FAIL',
  'LOAD_PUB_POD', 'LOAD_PUB_POD_SUCCEED', 'LOAD_PUB_POD_FAIL',
  'TOGGLE_SHARE_SHIPMENT',
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
    containerPackagings: [],
    clients: [],
  },
  formData: {
    key: null,
    shipmt_no: '',
    transit_time: 0,
    goodslist: [],
  },
  previewer: {
    visible: false,
    loaded: true,
    params: {},
    tabKey: null,
    shipmt: {
      goodslist: [],
    },
    dispatch: {
      id: -1,
      shipmt_no: '',
    },
    upstream: {
      id: -1,
      shipmt_no: '',
    },
    downstream: {
      id: -1,
      shipmt_no: '',
    },
    logs: [],
  },
  charges: {
    revenue: {},
    expense: {},
  },
  pAdvanceCharges: [],
  advanceCharges: [],
  pSpecialCharges: [],
  specialCharges: [],
  shipmtDetail: {
    shipmt: {},
    tracking: {
      points: [],
    },
    pod: {},
  },
  statistics: {
    srPartnerId: -1,
    srTenantId: -1,
    startDate: null,
    endDate: null,
    logs: {
      totalCount: 0,
      data: [],
      pageSize: 20,
      currentPage: 1,
      filters: {
        statusType: 'all',
      },
    },
    total: 0,
    atOrigin: 0,
    overtime: 0,
    intransit: 0,
    exception: 0,
    arrival: 0,
    todos: {
      acceptanceTotal: 0,
      trackingTotal: 0,
      podTotal: 0,
      billingTotal: 0,
      acceptanceList: {
        loaded: false,
        loading: false,
        pageSize: 20,
        current: 1,
        data: [],
        totalCount: 0,
      },
      trackingList: {
        loaded: false,
        loading: false,
        pageSize: 20,
        current: 1,
        data: [],
        totalCount: 0,
      },
      podList: {
        loaded: false,
        loading: false,
        pageSize: 20,
        current: 1,
        data: [],
        totalCount: 0,
      },
      billingList: {
        loaded: false,
        loading: false,
        pageSize: 20,
        current: 1,
        data: [],
        totalCount: 0,
      },
    },
  },
  changeShipmentModal: {
    visible: false,
    shipmtNo: '',
    type: '',
  },
  formRequireJudgeParams: {},
  totalWeightRequired: false,
  totalVolumeRequired: false,
  partners: [],
  recalculateChargeModal: {
    visible: false,
    shipmtNo: '',
  },
  shareShipmentModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_FORMREQUIRE:
      // force formData change to rerender after formrequire load
      return { ...state };
    case actionTypes.LOAD_FORMREQUIRE_SUCCEED:
      return { ...state, formRequire: action.result.data };
    case actionTypes.SET_CONSIGN_FIELDS:
      return { ...state, formData: { ...state.formData, ...action.data } };
    case actionTypes.SAVE_LOCAL_GOODS:
      return { ...state,
        formData: { ...state.formData,
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
      return { ...state, formData: { ...state.formData, ...formData } };
    }
    case actionTypes.LOAD_DRAFTFORM:
      return { ...state, formData: initialState.formData };
    case actionTypes.LOAD_DRAFTFORM_SUCCEED:
      return { ...state,
        formData: {
          ...state.formData, ...action.result.data.shipmt, goodslist: action.result.data.goodslist,
        } };
    case actionTypes.LOAD_DETAIL_SUCCEED: {
      return { ...state,
        previewer: {
          shipmt: action.result.data.shipmt,
          dispatch: action.result.data.dispatch,
          upstream: action.result.data.upstream,
          downstream: action.result.data.downstream,
          logs: action.result.data.logs,
          visible: true,
          loaded: true,
          tabKey: action.tabKey,
          params: action.params,
          row: action.row,
        } };
    }
    case actionTypes.LOAD_CHARGES_SUCCEED: {
      return { ...state, ...action.result.data };
    }
    case actionTypes.HIDE_PREVIWER: {
      return { ...state, previewer: { ...state.previewer, visible: false } };
    }
    case actionTypes.LOAD_PUB_DETAIL_SUCCEED: {
      return { ...state, shipmtDetail: { ...action.result.data } };
    }
    case actionTypes.SEND_SMS_MESSAGE_SUCCEED: {
      return { ...state };
    }
    case actionTypes.SHIPMENT_STATISTICS: {
      return { ...state, previewer: { ...state.previewer, loaded: false, visible: false } };
    }
    case actionTypes.SHIPMENT_STATISTICS_SUCCEED: {
      return { ...state,
        statistics: {
          ...state.statistics,
          ...action.result.data,
          ...action.params,
        },
      };
    }
    case actionTypes.SHIPMENT_SEARCH_SUCCEED: {
      return { ...state, searchResult: action.result.data };
    }
    case actionTypes.SHOW_CHANGE_SHIPMENT_MODAL: {
      return { ...state, changeShipmentModal: action.data };
    }
    case actionTypes.SHIPMENT_LOGS_SUCCEED: {
      return { ...state, statistics: { ...state.statistics, logs: action.result.data } };
    }
    case actionTypes.REMOVE_SHIPMENT_POINT_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, points: state.previewer.points.filter(item => item.id !== action.data.pointId) } };
    }
    case actionTypes.CHANGE_PREVIEWER_TAB: {
      return { ...state, previewer: { ...state.previewer, tabKey: action.data.tabKey } };
    }
    case actionTypes.CREATE_LOG_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case REPORT_LOC_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case CREATE_EXCEPTION_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case DEAL_EXCEPTION_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case SAVE_POD_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case LOAD_TRANSHIPMT: {
      return { ...state, previewer: { ...state.previewer, loaded: false, visible: false } };
    }
    case LOAD_PODSHIPMT: {
      return { ...state, previewer: { ...state.previewer, loaded: false, visible: false } };
    }
    case LOAD_EXCPSHIPMT: {
      return { ...state, previewer: { ...state.previewer, loaded: false, visible: false } };
    }
    case LOAD_DISPSHIPMENT: {
      return { ...state, previewer: { ...state.previewer, loaded: false, visible: false } };
    }
    case LOAD_APTSHIPMENT: {
      return { ...state, previewer: { ...state.previewer, loaded: false, visible: false } };
    }
    case LOAD_FEES: {
      return { ...state, previewer: { ...state.previewer, loaded: false, visible: false } };
    }
    case SAVE_EDIT_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case REVOKE_SHIPMT_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, visible: false } };
    }
    case CREATE_ADVANCE_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case CREATE_SPECIALCHARGE_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case actionTypes.UPDATE_FORM_REQUIRE_PARAMS: {
      return { ...state, formRequireJudgeParams: { ...state.formRequireJudgeParams, ...action.formRequireJudgeParams } };
    }
    case actionTypes.LOAD_TARIFF_BY_TRANSPORTINFO_SUCCEED: {
      let totalWeightRequired = false;
      let totalVolumeRequired = false;
      if (action.result.data) {
        const tariff = action.result.data;
        if (tariff.agreement.meter === TARIFF_METER_METHODS[0].value ||
          tariff.agreement.meter === TARIFF_METER_METHODS[1].value ||
          tariff.agreement.meter === TARIFF_METER_METHODS[3].value) {
          totalWeightRequired = true;
        } else if (tariff.agreement.meter === TARIFF_METER_METHODS[2].value) {
          totalVolumeRequired = true;
        }
      }
      return { ...state,
        totalWeightRequired,
        totalVolumeRequired,
        formRequireJudgeParams: { ...state.formRequireJudgeParams, ...action.formRequireJudgeParams } };
    }
    case actionTypes.LOAD_TARIFF_BY_TRANSPORTINFO_FAIL: {
      return { ...state,
        totalWeightRequired: false,
        totalVolumeRequired: false,
        formRequireJudgeParams: { ...state.formRequireJudgeParams, ...action.formRequireJudgeParams } };
    }
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, partners: action.result.data };
    case actionTypes.LOAD_DISPATCH_SHIPMENT:
      return { ...state,
        statistics: {
          ...state.statistics,
          todos: {
            ...state.statistics.todos,
            acceptanceList: { ...state.statistics.todos.acceptanceList, loading: true, loaded: false },
          },
        },
      };
    case actionTypes.LOAD_DISPATCH_SHIPMENT_SUCCEED:
      return { ...state,
        statistics: {
          ...state.statistics,
          todos: {
            ...state.statistics.todos,
            acceptanceList: { ...action.result.data, loading: false, loaded: true },
          },
        },
      };
    case actionTypes.LOAD_TRANSHIPMT:
      return { ...state,
        statistics: {
          ...state.statistics,
          todos: {
            ...state.statistics.todos,
            trackingList: { ...state.statistics.todos.trackingList, loading: true, loaded: false },
          },
        },
      };
    case actionTypes.LOAD_TRANSHIPMT_SUCCEED:
      return { ...state,
        statistics: {
          ...state.statistics,
          todos: {
            ...state.statistics.todos,
            trackingList: { ...action.result.data, loading: false, loaded: true },
          },
        },
      };
    case actionTypes.LOAD_PODSHIPMT:
      return { ...state,
        statistics: {
          ...state.statistics,
          todos: {
            ...state.statistics.todos,
            podList: { ...state.statistics.podList, loading: true, loaded: false },
          },
        },
      };
    case actionTypes.LOAD_PODSHIPMT_SUCCEED:
      return { ...state,
        statistics: {
          ...state.statistics,
          todos: {
            ...state.statistics.todos,
            podList: { ...action.result.data, loading: false, loaded: true },
          },
        },
      };
    case actionTypes.COUNT_TOTAL_SUCCEED:
      return { ...state,
        statistics: {
          ...state.statistics,
          todos: {
            ...state.statistics.todos,
            ...action.result.data,
          },
        },
      };
    case actionTypes.UPDATE_FEE_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case CHANGE_ACT_DATE_SUCCEED: {
      return { ...state, previewer: { ...state.previewer, loaded: false } };
    }
    case actionTypes.TOGGLE_RECALCULATE_CHARGE: {
      return { ...state, recalculateChargeModal: action.data };
    }
    case actionTypes.TOGGLE_SHARE_SHIPMENT: {
      return { ...state, shareShipmentModal: action.data };
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

export function loadShipmtDetail(No, tenantId, sourceType, tabKey, row) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DETAIL,
        actionTypes.LOAD_DETAIL_SUCCEED,
        actionTypes.LOAD_DETAIL_FAIL,
      ],
      endpoint: 'v1/transport/shipment/detail',
      method: 'get',
      params: { No, tenantId, sourceType },
      row,
      tabKey,
    },
  };
}

export function loadShipmtCharges(dispId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CHARGES,
        actionTypes.LOAD_CHARGES_SUCCEED,
        actionTypes.LOAD_CHARGES_FAIL,
      ],
      endpoint: 'v1/transport/shipment/charges',
      method: 'get',
      params: { dispId, tenantId },
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

export function loadPubShipmtPod(shipmtNo, podId, key) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PUB_POD,
        actionTypes.LOAD_PUB_POD_SUCCEED,
        actionTypes.LOAD_PUB_POD_FAIL,
      ],
      endpoint: 'public/v1/transport/shipment/pod',
      method: 'get',
      params: { shipmtNo, podId, key },
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

export function loadShipmentStatistics(cookie, tenantId, sDate, eDate, srPartnerId, srTenantId) {
  const params = { tenantId, startDate: sDate.toString(), endDate: eDate.toString(), srPartnerId, srTenantId };
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
      params,
    },
  };
}

export function loadShipmentEvents(cookie, { tenantId, startDate, endDate, type, pageSize, currentPage, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHIPMENT_LOGS,
        actionTypes.SHIPMENT_LOGS_SUCCEED,
        actionTypes.SHIPMENT_LOGS_FAIL,
      ],
      endpoint: 'v1/transport/shipment/events',
      method: 'get',
      cookie,
      params: { tenantId, startDate, endDate, type, pageSize, currentPage, filters: JSON.stringify(filters) },
    },
  };
}

export function searchShipment(searchText, subdomain) {
  const params = { searchText, subdomain };
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHIPMENT_SEARCH,
        actionTypes.SHIPMENT_SEARCH_SUCCEED,
        actionTypes.SHIPMENT_SEARCH_FAIL,
      ],
      endpoint: 'public/v1/transport/shipment/search',
      method: 'get',
      params,
    },
  };
}

export function loadShipmtPoints(shipmtNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SHIPMENT_POINTS,
        actionTypes.LOAD_SHIPMENT_POINTS_SUCCEED,
        actionTypes.LOAD_SHIPMENT_POINTS_FAIL,
      ],
      endpoint: 'v1/transport/shipment/points',
      method: 'get',
      params: { shipmtNo },
    },
  };
}

export function removeShipmtPoint(pointId, content, dispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_SHIPMENT_POINT,
        actionTypes.REMOVE_SHIPMENT_POINT_SUCCEED,
        actionTypes.REMOVE_SHIPMENT_POINT_FAIL,
      ],
      endpoint: 'v1/transport/shipment/removePoint',
      method: 'post',
      data: { pointId, content, dispId },
    },
  };
}

export function computeSaleCharge(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPUTE_SALECHARGE,
        actionTypes.COMPUTE_SALECHARGE_SUCCEED,
        actionTypes.COMPUTE_SALECHARGE_FAIL,
      ],
      endpoint: 'v1/transport/tariff/sale/compute',
      method: 'post',
      data,
      origin: 'mongo',
    },
  };
}

export function computeCostCharges(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPUTE_COSTCHARGE,
        actionTypes.COMPUTE_COSTCHARGE_SUCCEED,
        actionTypes.COMPUTE_COSTCHARGE_FAIL,
      ],
      endpoint: 'v1/transport/tariff/costs/compute',
      method: 'post',
      data,
      origin: 'mongo',
    },
  };
}

export function loadTariffByQuoteNo(quoteNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TARIFF_BY_QUOTENO,
        actionTypes.LOAD_TARIFF_BY_QUOTENO_SUCCEED,
        actionTypes.LOAD_TARIFF_BY_QUOTENO_FAIL,
      ],
      endpoint: 'v1/transport/tariff/byQuoteNo',
      method: 'get',
      params: { quoteNo },
      origin: 'mongo',
    },
  };
}

export function showChangeShipmentModal({ visible, shipmtNo, type = '' }) {
  return {
    type: actionTypes.SHOW_CHANGE_SHIPMENT_MODAL,
    data: { visible, shipmtNo, type },
  };
}

export function changePreviewerTab(tabKey) {
  return {
    type: actionTypes.CHANGE_PREVIEWER_TAB,
    data: { tabKey },
  };
}

export function createLog(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_LOG,
        actionTypes.CREATE_LOG_SUCCEED,
        actionTypes.CREATE_LOG_FAIL,
      ],
      endpoint: 'v1/transport/shipment/log',
      method: 'post',
      data,
    },
  };
}

export function onFormFieldsChange(props, fields) {
  const tenantId = props.tenantId;
  const createdDate = new Date();
  const formRequireJudgeParams = { ...props.formRequireJudgeParams, ...fields };
  const params = {
    tenantId,
    createdDate,
    partnerId: props.formData.customer_partner_id,
    partnerTenantId: props.formData.customer_tenant_id,
    transModeCode: formRequireJudgeParams.transport_mode_id ? formRequireJudgeParams.transport_mode_id.value : props.formData.transport_mode_id,
    goodsType: formRequireJudgeParams.goods_type ? formRequireJudgeParams.goods_type.value : props.formData.goods_type,
    pickupEstDate: formRequireJudgeParams.pickup_est_date && formRequireJudgeParams.pickup_est_date.value ? formRequireJudgeParams.pickup_est_date.value.toDate() : props.formData.pickup_est_date,
    deliverEstDate: formRequireJudgeParams.deliver_est_date && formRequireJudgeParams.deliver_est_date.value ? formRequireJudgeParams.deliver_est_date.value.toDate() : props.formData.deliver_est_date,
  };
  if (params.partnerId !== undefined &&
    params.transModeCode !== undefined && params.goodsType !== undefined &&
    params.pickupEstDate !== undefined && params.deliverEstDate !== undefined) {
    return {
      [CLIENT_API]: {
        types: [
          actionTypes.LOAD_TARIFF_BY_TRANSPORTINFO,
          actionTypes.LOAD_TARIFF_BY_TRANSPORTINFO_SUCCEED,
          actionTypes.LOAD_TARIFF_BY_TRANSPORTINFO_FAIL,
        ],
        method: 'get',
        endpoint: 'v1/transport/tariff/byTransportInfo',
        params,
        origin: 'mongo',
        formRequireJudgeParams,
      },
    };
  } else {
    return {
      type: actionTypes.UPDATE_FORM_REQUIRE_PARAMS,
      formRequireJudgeParams,
    };
  }
}

export function loadPartners(tenantId, roles, businessTypes) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, roles: JSON.stringify(roles), businessTypes: JSON.stringify(businessTypes) },
    },
  };
}

export function countTotal(filters) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COUNT_TOTAL,
        actionTypes.COUNT_TOTAL_SUCCEED,
        actionTypes.COUNT_TOTAL_FAIL,
      ],
      endpoint: 'v1/transport/shipment/dashboard/countTotal',
      method: 'post',
      data: filters,
    },
  };
}

export function loadDispatchTable({ tenantId, filters, pageSize, current }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISPATCH_SHIPMENT,
        actionTypes.LOAD_DISPATCH_SHIPMENT_SUCCEED,
        actionTypes.LOAD_DISPATCH_SHIPMENT_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/shipmts',
      method: 'get',
      params: { tenantId, filters: JSON.stringify(filters), pageSize, current },
    },
  };
}

export function loadTransitTable({ tenantId, filters, pageSize, currentPage }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSHIPMT,
        actionTypes.LOAD_TRANSHIPMT_SUCCEED,
        actionTypes.LOAD_TRANSHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/shipmts',
      method: 'get',
      params: { tenantId, filters: JSON.stringify(filters), pageSize, currentPage },
    },
  };
}

export function loadPodTable({ tenantId, filters, pageSize, currentPage }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PODSHIPMT,
        actionTypes.LOAD_PODSHIPMT_SUCCEED,
        actionTypes.LOAD_PODSHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod/shipmts',
      method: 'get',
      params: { tenantId, filters: JSON.stringify(filters), pageSize, currentPage },
    },
  };
}

export function prompt(dispId, promptLastAction) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PROMPT,
        actionTypes.PROMPT_SUCCEED,
        actionTypes.PROMPT_FAIL,
      ],
      endpoint: 'v1/transport/shipment/prompt',
      method: 'post',
      data: { dispId, promptLastAction },
    },
  };
}

export function getShipmtOrderNo(uuid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_SHIPMT_ORDER_NO,
        actionTypes.GET_SHIPMT_ORDER_NO_SUCCEED,
        actionTypes.GET_SHIPMT_ORDER_NO_FAIL,
      ],
      endpoint: 'v1/crm/get/shipmt/order/no',
      method: 'get',
      params: { uuid, type: 'tms' },
    },
  };
}

export function updateFee(dispId, fee) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_FEE,
        actionTypes.UPDATE_FEE_SUCCEED,
        actionTypes.UPDATE_FEE_FAIL,
      ],
      endpoint: 'v1/transport/fee/update',
      method: 'post',
      data: { dispId, fee },
    },
  };
}

export function toggleRecalculateChargeModal(visible, shipmtNo = '') {
  return {
    type: actionTypes.TOGGLE_RECALCULATE_CHARGE,
    data: { visible, shipmtNo },
  };
}

export function toggleShareShipmentModal(visible) {
  return {
    type: actionTypes.TOGGLE_SHARE_SHIPMENT,
    data: { visible },
  };
}
