import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/land/status/', [
  'SHOW_VEHICLE_MODAL', 'SHOW_DATE_MODAL', 'SHOW_POD_MODAL',
  'HIDE_VEHICLE_MODAL', 'HIDE_DATE_MODAL', 'HIDE_POD_MODAL',
  'SHOW_LOC_MODAL',
  'HIDE_LOC_MODAL',
  'REPORT_LOC', 'REPORT_LOC_SUCCEED', 'REPORT_LOC_FAIL',
  'SAVE_VEHICLE', 'SAVE_VEHICLE_SUCCEED', 'SAVE_VEHICLE_FAIL',
  'SAVE_DATE', 'SAVE_DATE_SUCCEED', 'SAVE_DATE_FAIL',
  'SAVE_POD', 'SAVE_POD_SUCCEED', 'SAVE_POD_FAIL',
  'LOAD_TRANSHIPMT', 'LOAD_TRANSHIPMT_FAIL', 'LOAD_TRANSHIPMT_SUCCEED',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'type', value : 'all' },
    /* { name: 'shipmt_no', value: ''} */
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
  },
  dateModal: {
    visible: false,
    dispId: -1,
    shipmtNo: '',
    type: 'pickup',
  },
  podModal: {
    visible: false,
    shipmtNo: '',
    dispId: -1,
  },
  locModal: {
    visible: false,
    transit: {
      parent_no: '',
      shipmt_no: '',
      disp_id: -1,
      transit_time: -1,
    },
  },
};

export const LOAD_TRANSHIPMT_SUCCEED = actionTypes.LOAD_TRANSHIPMT_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSHIPMT:
      return { ...state, loading: true };
    case actionTypes.LOAD_TRANSHIPMT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TRANSHIPMT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)
    };
    case actionTypes.SHOW_VEHICLE_MODAL:
      return { ...state,
        vehicleModal: { visible: true, dispId: action.data.dispId }
      };
    case actionTypes.HIDE_VEHICLE_MODAL:
      return { ...state,
        vehicleModal: { visible: false, dispId: -1 }
      };
    case actionTypes.SHOW_DATE_MODAL:
      return { ...state,
        dateModal: {
          visible: true, dispId: action.data.dispId,
          type: action.data.type,
          shipmtNo: action.data.shipmtNo,
        }
      };
    case actionTypes.HIDE_DATE_MODAL:
      return { ...state,
        dateModal: { visible: false, dispId: -1 }
      };
    case actionTypes.SHOW_POD_MODAL:
      return { ...state,
        podModal: {
          visible: true, dispId: action.data.dispId,
          shipmtNo: action.data.shipmtNo,
          parentDispId: action.data.parentDispId,
        }
      };
    case actionTypes.HIDE_POD_MODAL:
      return { ...state,
        podModal: { visible: false, dispId: -1 }
      };
    case actionTypes.SHOW_LOC_MODAL:
      return {
        ...state, locModal: {
          visible: true, transit: action.data
        }
      };
    case actionTypes.HIDE_LOC_MODAL:
      return {
        ...state, locModal: {
          visible: false, transit: {}
        }
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
      cookie
    }
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

export function saveVehicle(dispId, plate, driver, remark) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_VEHICLE,
        actionTypes.SAVE_VEHICLE_SUCCEED,
        actionTypes.SAVE_VEHICLE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/vehicle',
      method: 'post',
      data: { dispId, plate, driver, remark },
    }
  };
}

export function showDateModal(dispId, shipmtNo, type) {
  return {
    type: actionTypes.SHOW_DATE_MODAL,
    data: { dispId, type, shipmtNo },
  };
}

export function closeDateModal() {
  return {
    type: actionTypes.HIDE_DATE_MODAL,
  };
}

export function savePickOrDeliverDate(type, shipmtNo, dispId, actDate) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_DATE,
        actionTypes.SAVE_DATE_SUCCEED,
        actionTypes.SAVE_DATE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pickordeliverdate',
      method: 'post',
      data: { shipmtNo, dispId, type, actDate },
    }
  };
}

export function showPodModal(dispId, parentDispId, shipmtNo) {
  return {
    type: actionTypes.SHOW_POD_MODAL,
    data: { dispId, parentDispId, shipmtNo },
  };
}

export function closePodModal() {
  return {
    type: actionTypes.HIDE_POD_MODAL,
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
    }
  };
}

export function saveSubmitPod(shipmtNo, dispId, parentDispId,
                              submitter, signStatus, signRemark, photos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_POD,
        actionTypes.SAVE_POD_SUCCEED,
        actionTypes.SAVE_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod',
      method: 'post',
      data: { shipmtNo, dispId, parentDispId, submitter, signStatus, signRemark, photos },
    }
  };
}
