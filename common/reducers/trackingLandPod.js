import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/land/pod/', [
  'SHOW_AUDIT_MODAL', 'SHOW_AUDIT_MODAL_SUCCEED', 'SHOW_AUDIT_MODAL_FAIL',
  'HIDE_AUDIT_MODAL', 'CHANGE_FILTER',
  'AUDIT_POD', 'AUDIT_POD_SUCCEED', 'AUDIT_POD_FAIL',
  'RETURN_POD', 'RETURN_POD_SUCCEED', 'RETURN_POD_FAIL',
  'RESUBMIT_POD', 'RESUMBIT_POD_SUCCEED', 'RESUBMIT_POD_FAIL',
  'LOAD_PODSHIPMT', 'LOAD_PODSHIPMT_FAIL', 'LOAD_PODSHIPMT_SUCCEED',
  'LOAD_POD', 'LOAD_POD_SUCCEED', 'LOAD_POD_FAIL',
  'SHOW_POD_MODAL', 'SHOW_POD_MODAL_SUCCEED', 'SHOW_POD_MODAL_FAIL',
  'HIDE_POD_MODAL',
  'SAVE_POD', 'SAVE_POD_SUCCEED', 'SAVE_POD_FAIL',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'type', value: 'upload' },
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
  auditModal: {
    readonly: true,
    visible: false,
    dispId: -1,
    parentDispId: -1,
    podId: -1,
    sign_status: '',
    sign_remark: '',
    photos: '',
  },
  podModal: {
    visible: false,
    shipmtNo: '',
    podId: -1,
    dispId: -1,
    parentDispId: -1,
    sign_status: 1,
    sign_remark: '',
    photos: '',
  },
};

export const LOAD_PODSHIPMT_SUCCEED = actionTypes.LOAD_PODSHIPMT_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PODSHIPMT:
      return { ...state, loading: true,
        filters: JSON.parse(action.params.filters),
      };
    case actionTypes.LOAD_PODSHIPMT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_PODSHIPMT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
      };
    case actionTypes.LOAD_POD_SUCCEED:
      return { ...state, auditModal: {
        ...state.auditModal, ...action.result.data,
      }, podModal: {
        ...state.podModal, ...action.result.data,
      } };
    case actionTypes.SHOW_AUDIT_MODAL_SUCCEED:
      return { ...state,
        auditModal: {
          ...state.auditModal, visible: true, ...action.data, readonly: true,
          ...action.result.data,
        },
      };
    case actionTypes.HIDE_AUDIT_MODAL:
      return { ...state, auditModal: initialState.auditModal };
    case actionTypes.CHANGE_FILTER: {
      const filters = state.filters.filter(flt => flt.name !== action.data.field);
      if (action.data.value !== '' && action.data.value !== null && action.data.value !== undefined) {
        filters.push({ name: action.data.field, value: action.data.value });
      }
      return { ...state, filters };
    }
    case actionTypes.AUDIT_POD_SUCCEED: {
      const i = state.shipmentlist.data.findIndex(item => item.disp_id === action.data.dispId);
      const data = [...state.shipmentlist.data];
      data.splice(i, 1);
      const shipmentlist = { ...state.shipmentlist, data };
      return { ...state, shipmentlist };
    }
    case actionTypes.RETURN_POD_SUCCEED: {
      const i = state.shipmentlist.data.findIndex(item => item.disp_id === action.data.dispId);
      const data = [...state.shipmentlist.data];
      data.splice(i, 1);
      const shipmentlist = { ...state.shipmentlist, data };
      return { ...state, shipmentlist };
    }
    case actionTypes.SHOW_POD_MODAL_SUCCEED: {
      let data = initialState.podModal;
      if (action.result) {
        data = action.result.data;
      }
      return { ...state,
        podModal: {
          ...data,
          ...action.data,
          visible: true,
        },
      };
    }
    case actionTypes.HIDE_POD_MODAL:
      return { ...state, podModal: initialState.podModal };
    default:
      return state;
  }
}

export function loadPodTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PODSHIPMT,
        actionTypes.LOAD_PODSHIPMT_SUCCEED,
        actionTypes.LOAD_PODSHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod/shipmts',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function loadPod(podId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_POD,
        actionTypes.LOAD_POD_SUCCEED,
        actionTypes.LOAD_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod',
      method: 'get',
      params: { podId },
    },
  };
}

export function showAuditModal(dispId, parentDispId, podId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHOW_AUDIT_MODAL,
        actionTypes.SHOW_AUDIT_MODAL_SUCCEED,
        actionTypes.SHOW_AUDIT_MODAL_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod',
      method: 'get',
      params: { podId },
      data: { dispId, parentDispId, podId },
    },
  };
}

export function closePodAuditModal() {
  return {
    type: actionTypes.HIDE_AUDIT_MODAL,
  };
}

export function passAudit(podId, dispId, parentDispId, auditor, tenantId, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.AUDIT_POD,
        actionTypes.AUDIT_POD_SUCCEED,
        actionTypes.AUDIT_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod/audit',
      method: 'post',
      data: { podId, dispId, parentDispId, auditor, tenantId, loginId },
    },
  };
}

export function returnAudit(dispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RETURN_POD,
        actionTypes.RETURN_POD_SUCCEED,
        actionTypes.RETURN_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod/return',
      method: 'post',
      data: { dispId },
    },
  };
}

export function resubmitPod(dispId, parentDispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RESUBMIT_POD,
        actionTypes.RESUMBIT_POD_SUCCEED,
        actionTypes.RESUBMIT_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod/resubmit',
      method: 'post',
      data: { dispId, parentDispId },
    },
  };
}

export function changePodFilter(field, value) {
  return {
    type: actionTypes.CHANGE_FILTER,
    data: { field, value },
  };
}

export function showPodModal(podId, dispId, parentDispId, shipmtNo) {
  if (podId !== -1) {
    return {
      [CLIENT_API]: {
        types: [
          actionTypes.SHOW_POD_MODAL,
          actionTypes.SHOW_POD_MODAL_SUCCEED,
          actionTypes.SHOW_POD_MODAL_FAIL,
        ],
        endpoint: 'v1/transport/tracking/pod',
        method: 'get',
        params: { podId },
        data: { podId, dispId, parentDispId, shipmtNo },
      },
    };
  } else {
    return {
      type: actionTypes.SHOW_POD_MODAL_SUCCEED,
      data: { podId, dispId, parentDispId, shipmtNo },
    };
  }
}

export function closePodModal() {
  return {
    type: actionTypes.HIDE_POD_MODAL,
  };
}

export function saveSubmitPod(userType, shipmtNo, dispId, parentDispId,
  submitter, signStatus, signRemark, photos,
  loginId, tenantId, tenantName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_POD,
        actionTypes.SAVE_POD_SUCCEED,
        actionTypes.SAVE_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod',
      method: 'post',
      data: { userType, shipmtNo, dispId, parentDispId, submitter, signStatus, signRemark, photos, loginId, tenantId, tenantName },
    },
  };
}
