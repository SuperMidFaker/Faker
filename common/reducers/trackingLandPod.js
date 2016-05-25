import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/land/pod/', [
  'SHOW_AUDIT_MODAL', 'HIDE_AUDIT_MODAL',
  'AUDIT_POD', 'AUDIT_POD_SUCCEED', 'AUDIT_POD_FAIL',
  'LOAD_PODSHIPMT', 'LOAD_PODSHIPMT_FAIL', 'LOAD_PODSHIPMT_SUCCEED',
  'LOAD_POD', 'LOAD_POD_SUCCEED', 'LOAD_POD_FAIL',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'type', value : 'uploaded' },
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
  auditModal: {
    readonly: true,
    visible: false,
    dispId: -1,
    sign_status: '',
    sign_remark: '',
    photos: '',
  },
};

export const LOAD_PODSHIPMT_SUCCEED = actionTypes.LOAD_PODSHIPMT_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PODSHIPMT:
      return { ...state, loading: true };
    case actionTypes.LOAD_PODSHIPMT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_PODSHIPMT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)
    };
    case actionTypes.LOAD_POD_SUCCEED:
      return { ...state, auditModal: {
        ...state.auditModal, ...action.result.data
    }};
    case actionTypes.SHOW_AUDIT_MODAL:
      return { ...state,
        auditModal: {
          visible: true, dispId: action.data.dispId, readonly: true,
        }
      };
    case actionTypes.HIDE_AUDIT_MODAL:
      return { ...state, auditModal: initialState.auditModal };
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
      cookie
    }
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
    }
  };
}

export function showAuditModal(dispId) {
  return {
    type: actionTypes.SHOW_AUDIT_MODAL,
    data: { dispId },
  };
}

export function closePodModal() {
  return {
    type: actionTypes.HIDE_AUDIT_MODAL,
  };
}

export function saveAuditPod(shipmtNo, dispId, submitter, signStatus, signRemark, photos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.AUDIT_POD,
        actionTypes.AUDIT_POD_SUCCEED,
        actionTypes.AUDIT_POD_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod/audit',
      method: 'post',
      data: { shipmtNo, dispId, submitter, signStatus, signRemark, photos },
    }
  };
}
