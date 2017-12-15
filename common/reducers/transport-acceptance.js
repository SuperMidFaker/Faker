import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { DO_DISPATCH_SUCCEED, DO_DISPATCH_SEND_SUCCEED, SEGMENT_SUCCEED } from './transportDispatch';
const actionTypes = createActionTypes('@@welogix/transport/acceptance/', [
  'REVOKE_OR_REJECT', 'CLOSE_RE_MODAL',
  'SAVE_SHIPMT', 'SAVE_SHIPMT_FAIL', 'SAVE_SHIPMT_SUCCEED',
  'SAVE_PENDING', 'SAVE_PENDING_SUCCEED', 'SAVE_PENDING_FAIL',
  'SAVE_DRAFT', 'SAVE_DRAFT_FAIL', 'SAVE_DRAFT_SUCCEED',
  'ACCEPT_DRAFT', 'ACCEPT_DRAFT_SUCCEED', 'ACCEPT_DRAFT_FAIL',
  'LOAD_APTSHIPMENT', 'LOAD_APTSHIPMENT_FAIL', 'LOAD_APTSHIPMENT_SUCCEED',
  'ACCP_DISP', 'ACCP_DISP_FAIL', 'ACCP_DISP_SUCCEED',
  'REVOKE_SHIPMT', 'REVOKE_SHIPMT_SUCCEED', 'REVOKE_SHIPMT_FAIL',
  'REJECT_SHIPMT', 'REJECT_SHIPMT_SUCCEED', 'REJECT_SHIPMT_FAIL',
  'DEL_DRAFT', 'DEL_DRAFT_SUCCEED', 'DEL_DRAFT_FAIL',
  'SAVE_EDIT', 'SAVE_EDIT_SUCCEED', 'SAVE_EDIT_FAIL',
  'RETURN_DISP', 'RETURN_DISP_FAIL', 'RETURN_DISP_SUCCEED',
]);

const initialState = {
  submitting: false,
  table: {
    loaded: false,
    loading: false,
    filters: [
      /* { name: 'shipmt_no', value: ''} */
    ],
    sortField: 'created_date',
    sortOrder: 'desc',
    shipmentlist: {
      totalCount: 0,
      pageSize: 20,
      current: 1,
      data: [],
    },
  },
  revokejectModal: {
    type: '',
    visible: false,
    shipmtNo: '',
    dispId: -1,
  },
};

export const { LOAD_APTSHIPMENT, SAVE_EDIT_SUCCEED, REVOKE_SHIPMT_SUCCEED } = actionTypes;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_APTSHIPMENT:
      return {
        ...state,
        table: { ...state.table, loading: true },
      };
    case actionTypes.LOAD_APTSHIPMENT_FAIL:
      return { ...state, table: { ...state.table, loading: false } };
    case actionTypes.LOAD_APTSHIPMENT_SUCCEED:
      return {
        ...state,
        table: {
          ...state.table,
          loading: false,
          loaded: true,
          shipmentlist: action.result.data,
          filters: JSON.parse(action.params.filters),
        },
      };
    case actionTypes.SAVE_PENDING:
    case actionTypes.SAVE_SHIPMT:
    case actionTypes.SAVE_DRAFT:
    case actionTypes.SAVE_EDIT:
    case actionTypes.ACCEPT_DRAFT:
      return { ...state, submitting: true };
    case actionTypes.SAVE_PENDING_FAIL:
    case actionTypes.SAVE_SHIPMT_FAIL:
    case actionTypes.SAVE_DRAFT_FAIL:
    case actionTypes.SAVE_PENDING_SUCCEED:
    case actionTypes.SAVE_SHIPMT_SUCCEED:
    case actionTypes.SAVE_DRAFT_SUCCEED:
    case actionTypes.SAVE_EDIT_SUCCEED:
    case actionTypes.SAVE_EDIT_FAIL:
    case actionTypes.ACCEPT_DRAFT_SUCCEED:
    case actionTypes.ACCEPT_DRAFT_FAIL:
      return { ...state, submitting: false };
    case actionTypes.CLOSE_RE_MODAL:
      return { ...state, revokejectModal: { ...state.revokejectModal, visible: false } };
    case actionTypes.REVOKE_OR_REJECT:
      return {
        ...state,
        revokejectModal: {
          ...state.revokejectModal, visible: true, ...action.data,
        },
      };
    case actionTypes.REVOKE_SHIPMT_SUCCEED:
    case actionTypes.REJECT_SHIPMT_SUCCEED:
      return { ...state, revokejectModal: { ...state.revokejectModal, visible: false } };
    case actionTypes.RETURN_DISP_SUCCEED: {
      const { shipmtDispIds } = action.data;
      const data = [...state.table.shipmentlist.data];
      for (let i = 0; i < shipmtDispIds.length; i++) {
        const index = data.findIndex(item => item.key === shipmtDispIds[i]);
        data.splice(index, 1);
      }
      const shipmentlist = { ...state.table.shipmentlist, data };
      const table = { ...state.table, shipmentlist };
      return { ...state, table };
    }
    case DO_DISPATCH_SUCCEED: {
      return { ...state, table: { ...state.table, loaded: false } };
    }
    case DO_DISPATCH_SEND_SUCCEED: {
      return { ...state, table: { ...state.table, loaded: false } };
    }
    case SEGMENT_SUCCEED: {
      return { ...state, table: { ...state.table, loaded: false } };
    }
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
      cookie,
    },
  };
}

export function saveEdit(shipment, tenantId, loginId, type = '', msg = '') {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_EDIT,
        actionTypes.SAVE_EDIT_SUCCEED,
        actionTypes.SAVE_EDIT_FAIL,
      ],
      endpoint: 'v1/transport/shipment/save_edit',
      method: 'post',
      data: {
        shipment, tenantId, loginId, type, message: msg,
      },
    },
  };
}

export function savePending(shipment, sp) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_PENDING,
        actionTypes.SAVE_PENDING_SUCCEED,
        actionTypes.SAVE_PENDING_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/save',
      data: { shipment, sp },
    },
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
    },
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
    },
  };
}

export function acceptDraft(shipment, loginId, loginName, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCEPT_DRAFT,
        actionTypes.ACCEPT_DRAFT_SUCCEED,
        actionTypes.ACCEPT_DRAFT_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/draft/saveaccept',
      data: {
        shipment, loginId, loginName, tenantId,
      },
    },
  };
}

export function delDraft(shipmtno) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_DRAFT,
        actionTypes.DEL_DRAFT_SUCCEED,
        actionTypes.DEL_DRAFT_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/draft/del',
      data: { shipmtno },
    },
  };
}

export function acceptDispShipment(shipmtDispIds, acptId, acptName, disperId, disperName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCP_DISP,
        actionTypes.ACCP_DISP_SUCCEED,
        actionTypes.ACCP_DISP_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/accept',
      data: {
        shipmtDispIds, acptId, acptName, disperId, disperName,
      },
    },
  };
}

export function revokeOrReject(type, shipmtNo, dispId) {
  return {
    type: actionTypes.REVOKE_OR_REJECT,
    data: { type, shipmtNo, dispId },
  };
}

export function closeReModal() {
  return {
    type: actionTypes.CLOSE_RE_MODAL,
  };
}

export function revokeShipment(shipmtNo, shipmtDispId, reason) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REVOKE_SHIPMT,
        actionTypes.REVOKE_SHIPMT_SUCCEED,
        actionTypes.REVOKE_SHIPMT_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/revoke',
      data: { shipmtNo, shipmtDispId, reason },
    },
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
    },
  };
}

export function returnShipment({
  shipmtDispIds, tenantId, loginId, loginName,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RETURN_DISP,
        actionTypes.RETURN_DISP_SUCCEED,
        actionTypes.RETURN_DISP_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/return',
      data: {
        shipmtDispIds, tenantId, loginId, loginName,
      },
    },
  };
}
