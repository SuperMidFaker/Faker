import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'SHOW_PARTNER_MODAL', 'HIDE_PARTNER_MODAL', 'SET_MODAL_VIEWPORT',
  'HIDE_INVITE_MODAL', 'SHOW_INVITE_MODAL',
  'PARTNERS_LOAD', 'PARTNERS_LOAD_SUCCEED', 'PARTNERS_LOAD_FAIL',
  'ONL_PARTNER_INVITE', 'ONL_PARTNER_INVITE_SUCCEED', 'ONL_PARTNER_INVITE_FAIL',
  'OFFL_PARTNER_INVITE', 'OFFL_PARTNER_INVITE_SUCCEED', 'OFFL_PARTNER_INVITE_FAIL',
  'OFFLINE_PARTNER', 'OFFLINE_PARTNER_SUCCEED', 'OFFLINE_PARTNER_FAIL',
  'SEND_INVITE', 'SEND_INVITE_SUCCEED', 'SEND_INVITE_FAIL'
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    /* { name: , value: } */
  ],
  visibleModal: false,
  modalViewport: 'invite-initial',
  isPlatformTenant: false,
  inviteModal: {
    visible: false,
    step: 1,
    tenantId: -1,
    partnerCode: '',
    partnerName: ''
  },
  partnershipTypes: [
    /* { key:, name: count: } */
  ],
  partnerTenants: [
    /* { id:, name: } */
  ],
  partnerlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [
      /* { key:, name:, types: [{key:, name:}], other db column } */
    ]
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PARTNERS_LOAD:
      return { ...state, loading: true,
        filters: action.params.filters ? JSON.parse(action.params.filters) : [] };
    case actionTypes.PARTNERS_LOAD_SUCCEED:
      return { ...state, ...action.result.data, loading: false, loaded: true };
    case actionTypes.PARTNERS_LOAD_FAIL:
      return { ...state, loading: false, loaded: true };
    case actionTypes.SHOW_PARTNER_MODAL:
      return { ...state, visibleModal: true, modalViewport: initialState.modalViewport };
    case actionTypes.HIDE_PARTNER_MODAL:
      return { ...state, visibleModal: false };
    case actionTypes.SET_MODAL_VIEWPORT:
      return { ...state, modalViewport: action.viewport };
    case actionTypes.ONL_PARTNER_INVITE_SUCCEED:
      return { ...state, modalViewport: action.viewport, isPlatformTenant: true };
    case actionTypes.OFFL_PARTNER_INVITE_SUCCEED: {
      const partnerlist = { ...state.partnerlist };
      if (partnerlist.current * partnerlist.pageSize > partnerlist.totalCount) {
        // 当前页未满则添加
        partnerlist.data.push(action.result.data);
      }
      partnerlist.totalCount++;
      return { ...state, partnerlist, modalViewport: action.viewport, isPlatformTenant: false };
    }
    case actionTypes.HIDE_INVITE_MODAL:
      return { ...state, inviteModal: { ...state.inviteModal, visible: false } };
    case actionTypes.SHOW_INVITE_MODAL:
      return { ...state, inviteModal: {
        ...state.inviteModal, visible: true, step: 1, tenantId: action.partner.tenantId,
        partnerName: action.partner.name, partnerCode: action.partner.partnerCode
      } };
    case actionTypes.SEND_INVITE_SUCCEED:
      return { ...state, inviteModal: { ...state.inviteModal, step: 2 } };
    default:
      return state;
  }
}

export function loadPartners(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PARTNERS_LOAD, actionTypes.PARTNERS_LOAD_SUCCEED,
        actionTypes.PARTNERS_LOAD_FAIL],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params,
      cookie
    }
  };
}

export function showPartnerModal() {
  return {
    type: actionTypes.SHOW_PARTNER_MODAL
  };
}
export function hidePartnerModal() {
  return {
    type: actionTypes.HIDE_PARTNER_MODAL
  };
}

export function setModalViewport(viewport) {
  return {
    type: actionTypes.SET_MODAL_VIEWPORT,
    viewport
  };
}

export function inviteOnlPartner(tenantId, partnerId, partnerCode, partnerships, viewport) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ONL_PARTNER_INVITE, actionTypes.ONL_PARTNER_INVITE_SUCCEED,
        actionTypes.ONL_PARTNER_INVITE_FAIL],
      endpoint: 'v1/cooperation/partner/online',
      method: 'post',
      viewport,
      data: {
        tenantId,
        partnerId,
        partnerCode,
        partnerships
      }
    }
  };
}

export function inviteOfflPartner(tenantId, partnerName, partnerCode, partnerships, contact, viewport) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.OFFL_PARTNER_INVITE, actionTypes.OFFL_PARTNER_INVITE_SUCCEED,
        actionTypes.OFFL_PARTNER_INVITE_FAIL],
      endpoint: 'v1/cooperation/partner/offline',
      method: 'post',
      viewport,
      data: {
        contact,
        tenantId,
        partnerCode,
        partnerName,
        partnerships
      }
    }
  };
}

export function hideInviteModal() {
  return {
    type: actionTypes.HIDE_INVITE_MODAL
  };
}

export function showInviteModal(partner) {
  return {
    type: actionTypes.SHOW_INVITE_MODAL,
    partner
  };
}

export function sendInvitation(contact, tenantId, partnerCode, partnerName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_INVITE,
        actionTypes.SEND_INVITE_SUCCEED,
        actionTypes.SEND_INVITE_FAIL
      ],
      endpoint: 'v1/cooperation/partner/invitation',
      method: 'post',
      data: {
        contact,
        tenantId,
        partnerCode,
        partnerName
      }
    }
  };
}
