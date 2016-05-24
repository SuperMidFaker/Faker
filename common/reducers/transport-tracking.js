import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/', [
  'SHOW_VEHICLE_MODAL', 'SHOW_DATE_MODAL', 'SHOW_POD_MODAL',
  'HIDE_VEHICLE_MODAL', 'HIDE_DATE_MODAL', 'HIDE_POD_MODAL',
  'SAVE_VEHICLE', 'SAVE_VEHICLE_SUCCEED', 'SAVE_VEHICLE_FAIL',
  'SAVE_DATE', 'SAVE_DATE_SUCCEED', 'SAVE_DATE_FAIL',
  'SAVE_POD', 'SAVE_POD_SUCCEED', 'SAVE_POD_FAIL',
  'SAVE_SHIPMT', 'SAVE_SHIPMT_FAIL', 'SAVE_SHIPMT_SUCCEED',
  'SAVE_DRAFT', 'SAVE_DRAFT_FAIL', 'SAVE_DRAFT_SUCCEED',
  'LOAD_TRANSHIPMT', 'LOAD_TRANSHIPMT_FAIL', 'LOAD_TRANSHIPMT_SUCCEED',
]);

const initialState = {
  submitting: false,
  transit: {
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
  },
  pod: {
    loaded: false,
  },
};

export const LOAD_TRANSHIPMT_SUCCEED = actionTypes.LOAD_TRANSHIPMT_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSHIPMT:
      return { ...state, transit: { ...state.transit, loading: true, }};
    case actionTypes.LOAD_TRANSHIPMT_FAIL:
      return { ...state, transit: { ...state.transit, loading: false }};
    case actionTypes.LOAD_TRANSHIPMT_SUCCEED:
      return { ...state, transit: { ...state.transit, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)
    }};
    case actionTypes.SHOW_VEHICLE_MODAL:
      return { ...state, transit: { ...state.transit,
        vehicleModal: { visible: true, dispId: action.data.dispId }
      }};
    case actionTypes.HIDE_VEHICLE_MODAL:
      return { ...state, transit: { ...state.transit,
        vehicleModal: { visible: false, dispId: -1 }
      }};
    case actionTypes.SHOW_DATE_MODAL:
      return { ...state, transit: { ...state.transit,
        dateModal: {
          visible: true, dispId: action.data.dispId,
          type: action.data.type,
          shipmtNo: action.data.shipmtNo,
        }
      }};
    case actionTypes.HIDE_DATE_MODAL:
      return { ...state, transit: { ...state.transit,
        dateModal: { visible: false, dispId: -1 }
      }};
    case actionTypes.SHOW_POD_MODAL:
      return { ...state, transit: { ...state.transit,
        podModal: {
          visible: true, dispId: action.data.dispId,
          shipmtNo: action.data.shipmtNo,
        }
      }};
    case actionTypes.HIDE_POD_MODAL:
      return { ...state, transit: { ...state.transit,
        podModal: { visible: false, dispId: -1 }
      }};
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

export function showVehicleModal(dispId) {
  return {
    type: actionTypes.SHOW_VEHICLE_MODAL,
    data: { dispId },
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

export function showPodModal(dispId, shipmtNo) {
  return {
    type: actionTypes.SHOW_POD_MODAL,
    data: { dispId, shipmtNo },
  };
}

export function closePodModal() {
  return {
    type: actionTypes.HIDE_POD_MODAL,
  };
}

export function saveSubmitPod(shipmtNo, dispId, submitter, signStatus, signRemark, photos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_POD,
        actionTypes.SAVE_POD_SUCCEED,
        actionTypes.SAVE_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod',
      method: 'post',
      data: { shipmtNo, dispId, submitter, signStatus, signRemark, photos },
    }
  };
}
