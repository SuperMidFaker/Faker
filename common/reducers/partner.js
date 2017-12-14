import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_TYPEPARTNERS', 'LOAD_TYPEPARTNERS_SUCCEED', 'LOAD_TYPEPARTNERS_FAIL',
  'EDIT_PROVIDER_TYPES', 'EDIT_PROVIDER_TYPES_SUCCEED', 'EDIT_PROVIDER_TYPES_FAIL',
  'ADD_PARTNER', 'ADD_PARTNER_SUCCEED', 'ADD_PARTNER_FAIL',
  'CHECK_PARTNER', 'CHECK_PARTNER_SUCCEED', 'CHECK_PARTNER_FAIL',
  'EDIT_PARTNER', 'EDIT_PARTNER_SUCCEED', 'EDIT_PARTNER_FAIL',
  'CHANGE_PARTNER_STATUS', 'CHANGE_PARTNER_STATUS_SUCCEED', 'CHANGE_PARTNER_STATUS_FAIL',
  'DELETE_PARTNER', 'DELETE_PARTNER_SUCCEED', 'DELETE_PARTNER_FAIL',
  'INVITE_PARTNER', 'OPEN_SPMODAL', 'CLOSE_SPMODAL',
  'ADD_SP', 'ADD_SP_SUCCEED', 'ADD_SP_FAIL',
  'EDIT_SP', 'EDIT_SP_SUCCEED', 'EDIT_SP_FAIL',
  'MATCH_TENANT', 'MATCH_TENANT_SUCCEED', 'MATCH_TENANT_FAIL',
]);
// *TODO* customerModal brokerModal group together
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
  selectedMenuItemKey: '0', // 记录当前MenuItemKey的值,
  providerType: 'ALL', // 记录当前被选中的物流供应商, 值对应为:['ALL', 'FWD', 'CCB', 'TRS', 'WHS']
  visibleSpModal: false,
  spModal: { partner: {} },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PARTNERS:
      return { ...state, loading: true };
    case actionTypes.LOAD_PARTNERS_SUCCEED:
    case actionTypes.LOAD_TYPEPARTNERS_SUCCEED:
      return {
        ...state, partners: action.result.data, loaded: true, loading: false,
      };
    case actionTypes.SET_PROVIDER_TYPE:
      return { ...state, providerType: action.providerType };
    case actionTypes.ADD_PARTNER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.EDIT_PARTNER_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.CHANGE_PARTNER_STATUS_SUCCEED:
      return { ...state, loaded: false };
    case actionTypes.DELETE_PARTNER_SUCCEED:
      return { ...state, loaded: false };
    case actionTypes.INVITE_PARTNER:
    case actionTypes.EDIT_PROVIDER_TYPES_SUCCEED:
      return { ...state, loaded: false };
    case actionTypes.CLOSE_SPMODAL:
      return {
        ...state, visibleSpModal: false, spModal: initialState.spModal, matchedPartners: [],
      };
    case actionTypes.OPEN_SPMODAL:
      return { ...state, spModal: action.data, visibleSpModal: true };
    default:
      return state;
  }
}

export function loadPartners(params) { // tenantId role businessType from
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
    },
  };
}

export function loadPartnersByTypes(tenantId, roles, businessTypes) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TYPEPARTNERS,
        actionTypes.LOAD_TYPEPARTNERS_SUCCEED,
        actionTypes.LOAD_TYPEPARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, roles: JSON.stringify(roles), businessTypes: JSON.stringify(businessTypes) },
    },
  };
}

export function addPartner({
  tenantId, partnerInfo, role, business, businessType,
}) {
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
        businessType,
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

export function editPartner(partnerId, name, partnerUniqueCode, code, role, business, customsCode, businessType, contact, phone, email) {
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
        partnerUniqueCode,
        code,
        role,
        business,
        customsCode,
        businessType,
        contact,
        phone,
        email,
      },
    },
  };
}

export function changePartnerStatus(id, status, role, businessType) {
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
        businessType,
      },
    },
  };
}

export function deletePartner(id, role, businessType) {
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
        id, role, businessType,
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

export function openSpModal(partner, operation) {
  return { type: actionTypes.OPEN_SPMODAL, data: { partner, operation } };
}

export function closeSpModal() {
  return { type: actionTypes.CLOSE_SPMODAL };
}

export function addSp(sp) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SP,
        actionTypes.ADD_SP_SUCCEED,
        actionTypes.ADD_SP_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/spadd',
      method: 'post',
      data: sp,
    },
  };
}

export function editSp(sp) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_SP,
        actionTypes.EDIT_SP_SUCCEED,
        actionTypes.EDIT_SP_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/spedit',
      method: 'post',
      data: sp,
    },
  };
}

export function matchTenant(name) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MATCH_TENANT,
        actionTypes.MATCH_TENANT_SUCCEED,
        actionTypes.MATCH_TENANT_FAIL,
      ],
      endpoint: 'v1/cooperation/match/tenant',
      method: 'get',
      params: { name },
    },
  };
}
