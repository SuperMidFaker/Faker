import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inbound/', [
  'LOAD_INBOUND', 'LOAD_INBOUND_SUCCEED', 'LOAD_INBOUND_FAIL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'SEND_SHIPMENT', 'SEND_SHIPMENT_SUCCEED', 'SEND_SHIPMENT_FAIL',
  'OPEN_MODAL', 'CLOSE_MODAL', 'OPEN_CREATE_MODAL', 'CLOSE_CREATE_MODAL',
  'CREATE_SHIPMENT', 'CREATE_SHIPMENT_SUCCEED', 'CREATE_SHIPMENT_FAIL',
]);

const initialState = {
  loading: false,
  reload: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
    shipment_no: '',
  },
  sendModal: {
    visible: false,
    shipment: {
      trans_mode: '',
      bl_no: '',
      hawb: '',
    },
  },
  createModal: {
    visible: false,
  },
  brokerPartners: [],
  transpPartners: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_INBOUND:
      return { ...state, loading: true, reload: false, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_INBOUND_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_INBOUND_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, brokerPartners: action.result.data.brokers,
        transpPartners: action.result.data.transps };
    case actionTypes.OPEN_MODAL:
      return { ...state, sendModal: { visible: true, shipment: action.data } };
    case actionTypes.CLOSE_MODAL:
      return { ...state, sendModal: { ...state.sendModal, visible: false } };
    case actionTypes.OPEN_CREATE_MODAL:
      return { ...state, createModal: { visible: true } };
    case actionTypes.CLOSE_CREATE_MODAL:
      return { ...state, createModal: { visible: false } };
    case actionTypes.CREATE_SHIPMENT_SUCCEED:
      return { ...state, reload: true };
    default:
      return state;
  }
}

export function loadInbounds(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBOUND,
        actionTypes.LOAD_INBOUND_SUCCEED,
        actionTypes.LOAD_INBOUND_FAIL,
      ],
      endpoint: 'v1/scv/inbounds',
      method: 'get',
      params,
      origin: 'scv',
    },
  };
}

export function loadInboundPartners(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/scv/inbound/partners',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function openModal(shipment) {
  return {
    type: actionTypes.OPEN_MODAL,
    data: shipment,
  };
}

export function closeModal() {
  return {
    type: actionTypes.CLOSE_MODAL,
  };
}

export function openCreateModal() {
  return {
    type: actionTypes.OPEN_CREATE_MODAL,
  };
}

export function closeCreateModal() {
  return {
    type: actionTypes.CLOSE_CREATE_MODAL,
  };
}

export function sendInboundShipment(sendInbound) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_SHIPMENT,
        actionTypes.SEND_SHIPMENT_SUCCEED,
        actionTypes.SEND_SHIPMENT_FAIL,
      ],
      endpoint: 'v1/scv/inbound/send/shipment',
      method: 'post',
      data: sendInbound,
      origin: 'scv',
    },
  };
}

export function createShipment(shipment) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_SHIPMENT,
        actionTypes.CREATE_SHIPMENT_SUCCEED,
        actionTypes.CREATE_SHIPMENT_FAIL,
      ],
      endpoint: 'v1/scv/inbound/create/shipment',
      method: 'post',
      data: shipment,
      origin: 'scv',
    },
  };
}
