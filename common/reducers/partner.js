import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'SET_PROVIDER_TYPE',
  'EDIT_PROVIDER_TYPES', 'EDIT_PROVIDER_TYPES_SUCCEED', 'EDIT_PROVIDER_TYPES_FAIL',
  'ADD_PARTNER', 'ADD_PARTNER_SUCCEED', 'ADD_PARTNER_FAIL',
  'CHECK_PARTNER', 'CHECK_PARTNER_SUCCEED', 'CHECK_PARTNER_FAIL',
  'EDIT_PARTNER', 'EDIT_PARTNER_SUCCEED', 'EDIT_PARTNER_FAIL',
  'CHANGE_PARTNER_STATUS', 'CHANGE_PARTNER_STATUS_SUCCEED', 'CHANGE_PARTNER_STATUS_FAIL',
  'DELETE_PARTNER', 'DELETE_PARTNER_SUCCEED', 'DELETE_PARTNER_FAIL',
  'INVITE_PARTNER',
]);

const initialState = {
  loading: true,
  loaded: true,
  partnershipTypes: [
    /* { key:, name: count: } */
  ],
  partnerTenants: [
    /* { id:, name: } */
  ],
  partners: [],
  selectedMenuItemKey: '0',  // 记录当前MenuItemKey的值,
  providerType: 'ALL',        // 记录当前被选中的物流供应商, 值对应为:['ALL', 'FWD', 'CCB', 'TRS', 'WHS']
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PARTNERS:
      return { ...state, loading: true };
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, ...action.result.data, loaded: true, loading: false };
    case actionTypes.SET_PROVIDER_TYPE:
      return { ...state, providerType: action.providerType };
    case actionTypes.ADD_PARTNER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.EDIT_PARTNER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.CHANGE_PARTNER_STATUS_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.DELETE_PARTNER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.INVITE_PARTNER:
    case actionTypes.EDIT_PROVIDER_TYPES_SUCCEED: {
      return { ...state, loaded: false };
    }
    default:
      return state;
  }
}

export function loadPartners(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function setProviderType(providerType) {
  return {
    type: actionTypes.SET_PROVIDER_TYPE,
    providerType,
  };
}

export function addPartner({ tenantId, partnerInfo, role, business }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PARTNER,
        actionTypes.ADD_PARTNER_SUCCEED,
        actionTypes.ADD_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/add',
      method: 'post',
      data: {
        tenantId,
        partnerInfo,
        role,
        business,
      },
    },
  };
}

export function checkPartner({ tenantId, partnerInfo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHECK_PARTNER,
        actionTypes.CHECK_PARTNER_SUCCEED,
        actionTypes.CHECK_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/check',
      method: 'post',
      data: {
        tenantId,
        partnerInfo,
      },
    },
  };
}

export function editPartner(partnerId, name, code, role, business) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_PARTNER,
        actionTypes.EDIT_PARTNER_SUCCEED,
        actionTypes.EDIT_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/edit',
      method: 'post',
      id: partnerId,
      data: {
        partnerId,
        name,
        code,
        role,
        business,
      },
    },
  };
}

export function changePartnerStatus(id, status, role) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHANGE_PARTNER_STATUS,
        actionTypes.CHANGE_PARTNER_STATUS_SUCCEED,
        actionTypes.CHANGE_PARTNER_STATUS_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/change_status',
      method: 'post',
      data: {
        id,
        status,
        role,
      },
    },
  };
}

export function deletePartner(id, role) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_PARTNER,
        actionTypes.DELETE_PARTNER_SUCCEED,
        actionTypes.DELETE_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/delete',
      method: 'post',
      id,
      data: {
        id, role,
      },
    },
  };
}

export function invitePartner(id) {
  return {
    type: actionTypes.INVITE_PARTNER,
    id,
  };
}
