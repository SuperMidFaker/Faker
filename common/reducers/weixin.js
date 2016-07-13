import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  error: '',
  profile: {
    loaded: false,
    /* name, phone, email, position */
  },
  pod: {
    shipmtNo: '',
    dispId: -1,
    parentDispId: -1,
  },
  shipmentlist: {
    data: [],
    pageSize: 20,
    current: 1,
  },
  uploadedShipmentlist: {
    data: [],
    pageSize: 20,
    current: 1,
  },
  shipmentDispatchDetail: {},
};

const actions = [
  'WX_BIND', 'WX_BIND_SUCCEED', 'WX_BIND_FAIL',
  'WX_UNBIND', 'WX_UNBIND_SUCCEED', 'WX_UNBIND_FAIL',
  'WX_PROFILE_LOAD', 'WX_PROFILE_LOAD_SUCCEED', 'WX_PROFILE_LOAD_FAIL',
  'UPLOAD_POD',
  'LOAD_PODSHIPMT', 'LOAD_PODSHIPMT_SUCCEED', 'LOAD_PODSHIPMT_FAIL',
  'LOAD_UPLOADED_PODSHIPMT', 'LOAD_UPLOADED_PODSHIPMT_SUCCEED', 'LOAD_UPLOADED_PODSHIPMT_FAIL',
  'LOAD_SHIPMENTDISPATCH', 'LOAD_SHIPMENTDISPATCH_SUCCEED', 'LOAD_SHIPMENTDISPATCH_FAIL',
];
const domain = '@@welogix/weixin/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.WX_PROFILE_LOAD_SUCCEED:
      return { ...state, profile: { loaded: true, ...action.result.data } };
    case actionTypes.WX_UNBIND_SUCCEED:
      return { ...state, profile: { loaded: false } };
    case actionTypes.WX_BIND_FAIL:
      return { ...state, error: action.error.msg };
    case actionTypes.UPLOAD_POD:
      return { ...state,
        pod: {
          dispId: action.data.dispId,
          shipmtNo: action.data.shipmtNo,
          parentDispId: action.data.parentDispId,
        },
      };
    case actionTypes.LOAD_PODSHIPMT_SUCCEED:
      return { ...state, shipmentlist: action.result.data };
    case actionTypes.LOAD_UPLOADED_PODSHIPMT_SUCCEED:
      return { ...state, uploadedShipmentlist: action.result.data };
    case actionTypes.LOAD_SHIPMENTDISPATCH_SUCCEED:
      return { ...state, shipmentDispatchDetail: action.result.data };
    default:
      return state;
  }
}

export function loginBind(form) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WX_BIND, actionTypes.WX_BIND_SUCCEED, actionTypes.WX_BIND_FAIL],
      endpoint: 'public/v1/weixin/bind',
      method: 'post',
      data: form,
    },
  };
}

export function loadWelogixProfile(cookie) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.WX_PROFILE_LOAD,
        actionTypes.WX_PROFILE_LOAD_SUCCEED,
        actionTypes.WX_PROFILE_LOAD_FAIL,
      ],
      endpoint: 'v1/weixin/welogix/profile',
      method: 'get',
      cookie,
    },
  };
}

export function unbindAccount() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WX_UNBIND, actionTypes.WX_UNBIND_SUCCEED, actionTypes.WX_UNBIND_FAIL],
      endpoint: 'v1/weixin/unbind',
      method: 'post',
    },
  };
}

export function toUploadPod(dispId, parentDispId, shipmtNo) {
  return {
    type: actionTypes.UPLOAD_POD,
    data: { dispId, parentDispId, shipmtNo },
  };
}

export function loadPodTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PODSHIPMT,
        actionTypes.LOAD_PODSHIPMT_SUCCEED,
        actionTypes.LOAD_PODSHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/shipmts',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function loadUploadedPodTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_UPLOADED_PODSHIPMT,
        actionTypes.LOAD_UPLOADED_PODSHIPMT_SUCCEED,
        actionTypes.LOAD_UPLOADED_PODSHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/pod/shipmts',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function getShipmentDispatch(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SHIPMENTDISPATCH,
        actionTypes.LOAD_SHIPMENTDISPATCH_SUCCEED,
        actionTypes.LOAD_SHIPMENTDISPATCH_FAIL,
      ],
      endpoint: 'v1/transport/shipment/detail',
      method: 'get',
      params,
      cookie,
    },
  };
}
