import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/acceptance/', [
  'HIDE_ACCEPT_MODAL',
  'LOAD_DISPATCHERS', 'LOAD_DISPATCHERS_SUCCEED', 'LOAD_DISPATCHERS_FAIL',
  'SAVE_SHIPMT', 'SAVE_SHIPMT_FAIL', 'SAVE_SHIPMT_SUCCEED',
  'SAVE_DRAFT', 'SAVE_DRAFT_FAIL', 'SAVE_DRAFT_SUCCEED',
  'LOAD_APTSHIPMENT', 'LOAD_APTSHIPMENT_FAIL', 'LOAD_APTSHIPMENT_SUCCEED',
  'ACCP_DISP', 'ACCP_DISP_FAIL', 'ACCP_DISP_SUCCEED',
]);

const initialState = {
  table: {
    loaded: false,
    loading: false,
    filters: [
      { name: 'type', value : 'unaccepted' },
      /* { name: 'shipmt_no', value: ''} */
    ],
    submitting: false,
    shipmentlist: {
      totalCount: 0,
      pageSize: 10,
      current: 1,
      data: [],
    }
  },
  acceptModal: {
    visible: false,
    dispatchId: -1,
    dispatchers: [],
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_APTSHIPMENT:
      return { ...state, table: { ...state.table, loading: true,
    }};
    case actionTypes.LOAD_APTSHIPMENT_FAIL:
      return { ...state, table: { ...state.table, loading: false }};
    case actionTypes.LOAD_APTSHIPMENT_SUCCEED:
      return { ...state, table: { ...state.table, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)
    }};
    case actionTypes.SAVE_SHIPMT:
    case actionTypes.SAVE_DRAFT:
      return { ...state, table: { ...state.table, submitting: true } };
    case actionTypes.SAVE_SHIPMT_FAIL:
    case actionTypes.SAVE_DRAFT_FAIL:
      return { ...state, table: { ...state.table, submitting: false } };
    case actionTypes.SAVE_SHIPMT_SUCCEED: {
      let found = false;
      state.table.filters.forEach(flt => {
        if (flt.name === 'type' && flt.value === 'accepted') {
          found = true;
          return;
        }
      });
      return found ? {
        ...state, table: {
          ...state.table, submitting: false,
          shipmentlist: {
            ...state.table.shipmentlist,
            totalCount: state.table.shipmentlist + 1,
            data: state.table.shipmentlist.pageSize * state.table.shipmentlist.current < state.table.shipmentlist.totalCount
              ? [...state.table.shipmentlist.data, action.data.result] : state.table.shipmentlist.data
          }
        }
      } : state;
    }
    case actionTypes.SAVE_DRAFT_SUCCEED:
      return { ...state, table: { ...state.table, submitting: false }};
    case actionTypes.HIDE_ACCEPT_MODAL:
      return { ...state, acceptModal: { ...state.acceptModal, visible: false }};
    case actionTypes.LOAD_DISPATCHERS:
      return { ...state, acceptModal: { ...state.acceptModal, visible: true,
        dispatchId: action.modal.dispId }};
    case actionTypes.LOAD_DISPATCHERS_SUCCEED:
      return { ...state, acceptModal: { ...state.acceptModal, dispatchers: action.result.data }};
    case actionTypes.ACCP_DISP_SUCCEED:
      return { ...state, acceptModal: { ...state.acceptModal, visible: false }};
    default:
      return state;
  }
}

export function loadTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_APTSHIPMENT,
        actionTypes.LOAD_APTSHIPMENT_SUCCEED,
        actionTypes.LOAD_APTSHIPMENT_FAIL,
      ],
      endpoint: 'v1/transport/shipments',
      method: 'get',
      params,
      cookie
    }
  };
}

export function saveAndAccept(shipment, sp) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_SHIPMT,
        actionTypes.SAVE_SHIPMT_SUCCEED,
        actionTypes.SAVE_SHIPMT_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/saveaccept',
      data: { shipment, sp },
    }
  };
}

export function saveDraft(shipment, sp) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_DRAFT,
        actionTypes.SAVE_DRAFT_SUCCEED,
        actionTypes.SAVE_DRAFT_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/draft',
      data: { shipment, sp },
    }
  };
}

export function loadAcceptDispatchers(tenantId, dispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISPATCHERS,
        actionTypes.LOAD_DISPATCHERS_SUCCEED,
        actionTypes.LOAD_DISPATCHERS_FAIL,
      ],
      method: 'get',
      endpoint: 'v1/transport/shipment/dispatchers',
      params: { tenantId },
      modal: { dispId },
    }
  };
}

export function closeAcceptModal() {
  return {
    type: actionTypes.HIDE_ACCEPT_MODAL,
  };
}

export function acceptDispShipment(shipmtDispId, acptId, acptName, disperId, disperName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCP_DISP,
        actionTypes.ACCP_DISP_SUCCEED,
        actionTypes.ACCP_DISP_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/accept',
      data: { shipmtDispId, acptId, acptName, disperId, disperName },
    }
  };
}
