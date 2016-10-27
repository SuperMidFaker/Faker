import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/land/status/', [
  'SHOW_VEHICLE_MODAL', 'SHOW_DATE_MODAL',
  'HIDE_VEHICLE_MODAL', 'HIDE_DATE_MODAL', 'SHOW_SHIPMENT_ADVANCE_MODAL',
  'SHOW_SPECIAL_CHARGE_MODAL',
  'SHOW_LOC_MODAL', 'HIDE_LOC_MODAL', 'CHANGE_FILTER',
  'REPORT_LOC', 'REPORT_LOC_SUCCEED', 'REPORT_LOC_FAIL',
  'LOAD_LASTPOINT', 'LOAD_LASTPOINT_SUCCEED', 'LOAD_LASTPOINT_FAIL',
  'SAVE_VEHICLE', 'SAVE_VEHICLE_SUCCEED', 'SAVE_VEHICLE_FAIL',
  'SAVE_DATE', 'SAVE_DATE_SUCCEED', 'SAVE_DATE_FAIL',
  'SAVE_BATCH_DATE', 'SAVE_BATCH_DATE_SUCCEED', 'SAVE_BATCH_DATE_FAIL',
  'LOAD_TRANSHIPMT', 'LOAD_TRANSHIPMT_FAIL', 'LOAD_TRANSHIPMT_SUCCEED',
  'DELIVER_CONFIRM', 'DELIVER_CONFIRM_SUCCEED', 'DELIVER_CONFIRM_FAIL',
  'CREATE_ADVANCE', 'CREATE_ADVANCE_SUCCEED', 'CREATE_ADVANCE_FAIL',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'type', value: 'all' },
    { name: 'shipmt_no', value: '' },
  ],
  /*
     sortField: 'created_date',
     sortOrder: 'desc',
     */
  shipmentlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  vehicleModal: {
    visible: false,
    dispId: -1,
    shipmtNo: '',
  },
  dateModal: {
    visible: false,
    shipments: [],
    type: 'pickup',
  },
  shipmentAdvanceModal: {
    visible: false,
    dispId: -1,
    shipmtNo: '',
    transportModeId: -1,
    customerPartnerId: -1,
    goodsType: -1,
  },
  shipmentSpecialChargeModal: {
    visible: false,
    dispId: -1,
    parentDispId: -1,
    shipmtNo: '',
  },
  locModal: {
    visible: false,
    transit: {
      parent_no: '',
      shipmt_no: '',
      disp_id: -1,
    },
  },
  locReportedShipments: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSHIPMT:
      return { ...state, loading: true,
        filters: JSON.parse(action.params.filters),
      };
    case actionTypes.LOAD_TRANSHIPMT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TRANSHIPMT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
    };
    case actionTypes.SHOW_VEHICLE_MODAL:
      return { ...state,
        vehicleModal: { visible: true, ...action.data },
      };
    case actionTypes.HIDE_VEHICLE_MODAL:
      return { ...state, vehicleModal: initialState.vehicleModal };
    case actionTypes.SHOW_DATE_MODAL:
      return { ...state,
        dateModal: {
          visible: true,
          shipments: action.data.shipments,
          type: action.data.type,
        },
      };
    case actionTypes.HIDE_DATE_MODAL:
      return { ...state, dateModal: initialState.dateModal };
    case actionTypes.SHOW_LOC_MODAL:
      return {
        ...state, locModal: {
          visible: true, transit: action.data,
        },
      };
    case actionTypes.HIDE_LOC_MODAL:
      return {
        ...state, locModal: {
          visible: false, transit: {},
        },
      };
    case actionTypes.REPORT_LOC_SUCCEED:
      return {
        ...state, locReportedShipments: [
          ...state.locReportedShipments, action.data.shipmtNo,
        ],
      };
    case actionTypes.CHANGE_FILTER: {
      const filters = state.filters.filter(flt => flt.name !== action.data.field);
      if (action.data.value !== '' && action.data.value !== null && action.data.value !== undefined) {
        filters.push({ name: action.data.field, value: action.data.value });
      }
      return { ...state, filters };
    }
    case actionTypes.SHOW_SHIPMENT_ADVANCE_MODAL:
      return {
        ...state, shipmentAdvanceModal: action.data,
      };
    case actionTypes.SHOW_SPECIAL_CHARGE_MODAL:
      return {
        ...state, shipmentSpecialChargeModal: action.data,
      };
    case actionTypes.DELIVER_CONFIRM_SUCCEED:
      return {
        ...state,
      };
    default:
      return state;
  }
}

export function loadTransitTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSHIPMT,
        actionTypes.LOAD_TRANSHIPMT_SUCCEED,
        actionTypes.LOAD_TRANSHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/shipmts',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function showVehicleModal(dispId, shipmtNo) {
  return {
    type: actionTypes.SHOW_VEHICLE_MODAL,
    data: { dispId, shipmtNo },
  };
}

export function closeVehicleModal() {
  return {
    type: actionTypes.HIDE_VEHICLE_MODAL,
  };
}

export function saveVehicle(shipmtNo, dispId, plate, driver, remark) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_VEHICLE,
        actionTypes.SAVE_VEHICLE_SUCCEED,
        actionTypes.SAVE_VEHICLE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/vehicle',
      method: 'post',
      data: { shipmtNo, dispId, plate, driver, remark },
    },
  };
}

export function showDateModal(shipments, type) {
  return {
    type: actionTypes.SHOW_DATE_MODAL,
    data: { shipments, type },
  };
}

export function closeDateModal() {
  return {
    type: actionTypes.HIDE_DATE_MODAL,
  };
}

export function savePickOrDeliverDate(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_DATE,
        actionTypes.SAVE_DATE_SUCCEED,
        actionTypes.SAVE_DATE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pickordeliverdate',
      method: 'post',
      data,
    },
  };
}

export function saveBatchPickOrDeliverDate(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_BATCH_DATE,
        actionTypes.SAVE_BATCH_DATE_SUCCEED,
        actionTypes.SAVE_BATCH_DATE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pickordeliverdate_multiple',
      method: 'post',
      data,
    },
  };
}

export function showLocModal(transit) {
  return {
    type: actionTypes.SHOW_LOC_MODAL,
    data: transit,
  };
}

export function closeLocModal() {
  return {
    type: actionTypes.HIDE_LOC_MODAL,
  };
}

export function reportLoc(tenantId, shipmtNo, parentNo, point) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REPORT_LOC,
        actionTypes.REPORT_LOC_SUCCEED,
        actionTypes.REPORT_LOC_FAIL,
      ],
      endpoint: 'v1/transport/tracking/point',
      method: 'post',
      data: { tenantId, shipmtNo, parentNo, point },
    },
  };
}

export function loadShipmtLastPoint(shipmtNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_LASTPOINT,
        actionTypes.LOAD_LASTPOINT_SUCCEED,
        actionTypes.LOAD_LASTPOINT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/lastpoint',
      method: 'get',
      params: { shipmtNo },
    },
  };
}

export function changeStatusFilter(field, value) {
  return {
    type: actionTypes.CHANGE_FILTER,
    data: { field, value },
  };
}

export function showShipmentAdvanceModal({ visible, dispId, shipmtNo, transportModeId, customerPartnerId, goodsType }) {
  return {
    type: actionTypes.SHOW_SHIPMENT_ADVANCE_MODAL,
    data: { visible, dispId, shipmtNo, transportModeId, customerPartnerId, goodsType },
  };
}

export function showSpecialChargeModal({ visible, dispId, shipmtNo, parentDispId }) {
  return {
    type: actionTypes.SHOW_SPECIAL_CHARGE_MODAL,
    data: { visible, dispId, shipmtNo, parentDispId },
  };
}

export function deliverConfirm(shipmtNo, dispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELIVER_CONFIRM,
        actionTypes.DELIVER_CONFIRM_SUCCEED,
        actionTypes.DELIVER_CONFIRM_FAIL,
      ],
      endpoint: 'v1/transport/tracking/deliverConfirm',
      method: 'post',
      data: { shipmtNo, dispId },
    },
  };
}

export function createAdvance({ shipmtNo, dispId, name, code, amount, remark,
        photos, submitter: loginName, loginId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_ADVANCE,
        actionTypes.CREATE_ADVANCE_SUCCEED,
        actionTypes.CREATE_ADVANCE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/advance',
      method: 'post',
      data: { shipmtNo, dispId, name, code, amount, remark,
        photos, submitter: loginName, loginId, tenantId },
    },
  };
}
