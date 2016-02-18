import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'PARTNER_MODAL_OPENCLOSE', 'SET_MODAL_VIEWPORT',
  'PARTNERS_LOAD', 'PARTNERS_LOAD_SUCCEED', 'PARTNERS_LOAD_FAIL',
  'PARTNERSHIP_TYPE_LOAD', 'PARTNERSHIP_TYPE_LOAD_SUCCEED', 'PARTNERSHIP_TYPE_LOAD_FAIL',
  'ONL_PARTNER_INVITE', 'ONL_PARTNER_INVITE_SUCCEED', 'ONL_PARTNER_INVITE_FAIL',
  'OFFL_PARTNER_INVITE', 'OFFL_PARTNER_INVITE_SUCCEED', 'OFFL_PARTNER_INVITE_FAIL',
  'OFFLINE_PARTNER', 'OFFLINE_PARTNER_SUCCEED', 'OFFLINE_PARTNER_FAIL'
]);

const initialState = {
  loaded: false,
  loading: false,
  visibleModal: false,
  modalViewport: 'invite-initial',
  partnershipTypes: [
    /* { key:, name: } */
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
      return { ...state, loading: true };
    case actionTypes.PARTNERS_LOAD_SUCCEED:
      return { ...state, ...action.result.data, loading: false, loaded: true };
    case actionTypes.PARTNERS_LOAD_FAIL:
      return { ...state, loading: false, loaded: true };
    case actionTypes.PARTNERSHIP_TYPE_LOAD_SUCCEED:
      return { ...state, partnershipTypes: action.result.data };
    case actionTypes.PARTNER_MODAL_OPENCLOSE:
      return { ...state, visibleModal: !state.visibleModal };
    case actionTypes.SET_MODAL_VIEWPORT:
      return { ...state, modalViewport: action.viewport };
    case actionTypes.ONL_PARTNER_INVITE_SUCCEED:
      return { ...state, modalViewport: action.viewport };
    case actionTypes.OFFL_PARTNER_INVITE_SUCCEED: {
      const partnerlist = { ...state.partnerlist };
      if ((partnerlist.current - 1) * partnerlist.pageSize <= partnerlist.totalCount
          && partnerlist.current * partnerlist.pageSize > partnerlist.totalCount) {
        partnerlist.data.push(action.result.data);
      }
      partnerlist.totalCount++;
      return { ...state, partnerlist, modalViewport: action.viewport };
    }
    default:
      return state;
  }
}

export function loadPartners(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PARTNERS_LOAD, actionTypes.PARTNERS_LOAD_SUCCEED, actionTypes.PARTNERS_LOAD_FAIL],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params,
      cookie
    }
  };
}

export function loadPartnershipTypes(cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PARTNERSHIP_TYPE_LOAD, actionTypes.PARTNERSHIP_TYPE_LOAD_SUCCEED,
        actionTypes.PARTNERSHIP_TYPE_LOAD_FAIL],
      endpoint: 'v1/cooperation/partnership/types',
      method: 'get',
      cookie
    }
  };
}

export function openClosePartnerModal() {
  return {
    type: actionTypes.PARTNER_MODAL_OPENCLOSE
  };
}

export function setModalViewport(viewport) {
  return {
    type: actionTypes.SET_MODAL_VIEWPORT,
    viewport: viewport || initialState.modalViewport
  };
}

export function inviteOnlPartner(tenantId, partnerId, partnerships, viewport) {
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
        partnerships
      }
    }
  };
}

export function inviteOfflPartner(tenantId, partnerName, partnerships, contact, viewport) {
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
        partnerName,
        partnerships
      }
    }
  };
}
