import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/', [
  'HIDE_ACCEPT_MODAL', 'REVOKE_OR_REJECT', 'CLOSE_RE_MODAL',
  'LOAD_DISPATCHERS', 'LOAD_DISPATCHERS_SUCCEED', 'LOAD_DISPATCHERS_FAIL',
  'SAVE_SHIPMT', 'SAVE_SHIPMT_FAIL', 'SAVE_SHIPMT_SUCCEED',
  'SAVE_DRAFT', 'SAVE_DRAFT_FAIL', 'SAVE_DRAFT_SUCCEED',
  'LOAD_SHIPMT', 'LOAD_SHIPMT_FAIL', 'LOAD_SHIPMT_SUCCEED',
  'ACCP_DISP', 'ACCP_DISP_FAIL', 'ACCP_DISP_SUCCEED',
  'REVOKE_SHIPMT', 'REVOKE_SHIPMT_SUCCEED', 'REVOKE_SHIPMT_FAIL',
  'REJECT_SHIPMT', 'REJECT_SHIPMT_SUCCEED', 'REJECT_SHIPMT_FAIL',
  'SAVE_EDIT', 'SAVE_EDIT_SUCCEED', 'SAVE_EDIT_FAIL'
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
    }
  },
  pod: {
    loaded: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SHIPMT:
      return { ...state, transit: { ...state.transit, loading: true, }};
    case actionTypes.LOAD_SHIPMT_FAIL:
      return { ...state, transit: { ...state.transit, loading: false }};
    case actionTypes.LOAD_SHIPMT_SUCCEED:
      return { ...state, transit: { ...state.transit, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)
    }};
    case actionTypes.SAVE_SHIPMT:
    case actionTypes.SAVE_DRAFT:
      return { ...state, submitting: true };
    case actionTypes.SAVE_SHIPMT_FAIL:
    case actionTypes.SAVE_DRAFT_FAIL:
      return { ...state, submitting: false };
    case actionTypes.SAVE_SHIPMT_SUCCEED: {
      let found = false;
      state.table.filters.forEach(flt => {
        if (flt.name === 'type' && flt.value === 'accepted') {
          found = true;
          return;
        }
      });
      return found ? {
        ...state, submitting: false, table: {
          ...state.table,
          shipmentlist: {
            ...state.table.shipmentlist,
            totalCount: state.table.shipmentlist + 1,
            data: state.table.shipmentlist.pageSize * state.table.shipmentlist.current < state.table.shipmentlist.totalCount
              ? [...state.table.shipmentlist.data, action.data.result] : state.table.shipmentlist.data
          }
        }
      } : { ...state, submitting: false };
    }
    case actionTypes.SAVE_DRAFT_SUCCEED:
      return { ...state, submitting: false };
    case actionTypes.HIDE_ACCEPT_MODAL:
      return { ...state, acceptModal: { ...state.acceptModal, visible: false }};
    case actionTypes.LOAD_DISPATCHERS:
      return { ...state, acceptModal: { ...state.acceptModal, visible: true,
        dispatchId: action.modal.dispId }};
    case actionTypes.LOAD_DISPATCHERS_SUCCEED:
      return { ...state, acceptModal: { ...state.acceptModal, dispatchers: action.result.data }};
    case actionTypes.ACCP_DISP_SUCCEED:
      return { ...state, acceptModal: { ...state.acceptModal, visible: false }};
    case actionTypes.CLOSE_RE_MODAL:
      return { ...state, revokejectModal: { ...state.revokejectModal, visible: false }};
    case actionTypes.REVOKE_OR_REJECT:
      return {
      ...state, revokejectModal: {
        ...state.revokejectModal, visible: true, dispId: action.data.dispId,
        type: action.data.type
      }};
    case actionTypes.REVOKE_SHIPMT_SUCCEED:
    case actionTypes.REJECT_SHIPMT_SUCCEED:
      return { ...state, revokejectModal: { ...state.revokejectModal, visible: false }};
    default:
      return state;
  }
}

export function loadTransitTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SHIPMT,
        actionTypes.LOAD_SHIPMT_SUCCEED,
        actionTypes.LOAD_SHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/shipmts',
      method: 'get',
      params,
      cookie
    }
  };
}

export function saveEdit(shipment, tenantId, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_EDIT,
        actionTypes.SAVE_EDIT_SUCCEED,
        actionTypes.SAVE_EDIT_FAIL
      ],
      endpoint: 'v1/transport/shipment/save_edit',
      method: 'post',
      data: { shipment, tenantId, loginId }
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

export function revokeOrReject(type, dispId) {
  return {
    type: actionTypes.REVOKE_OR_REJECT,
    data: { type, dispId }
  };
}

export function closeReModal() {
  return {
    type: actionTypes.CLOSE_RE_MODAL,
  };
}

export function revokeShipment(shipmtDispId, reason) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REVOKE_SHIPMT,
        actionTypes.REVOKE_SHIPMT_SUCCEED,
        actionTypes.REVOKE_SHIPMT_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/revoke',
      data: { shipmtDispId, reason },
    }
  };
}

export function rejectShipment(dispId, reason) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REJECT_SHIPMT,
        actionTypes.REJECT_SHIPMT_SUCCEED,
        actionTypes.REJECT_SHIPMT_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/reject',
      data: { dispId, reason },
    }
  };
}
