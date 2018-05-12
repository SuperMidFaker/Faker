import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'LOAD_PARTNERLIST', 'LOAD_PARTNERLIST_SUCCEED', 'LOAD_PARTNERLIST_FAIL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_TYPEPARTNERS', 'LOAD_TYPEPARTNERS_SUCCEED', 'LOAD_TYPEPARTNERS_FAIL',
  'ADD_PARTNER', 'ADD_PARTNER_SUCCEED', 'ADD_PARTNER_FAIL',
  'CHECK_PARTNER', 'CHECK_PARTNER_SUCCEED', 'CHECK_PARTNER_FAIL',
  'EDIT_PARTNER', 'EDIT_PARTNER_SUCCEED', 'EDIT_PARTNER_FAIL',
  'CHANGE_PARTNER_STATUS', 'CHANGE_PARTNER_STATUS_SUCCEED', 'CHANGE_PARTNER_STATUS_FAIL',
  'DELETE_PARTNER', 'DELETE_PARTNER_SUCCEED', 'DELETE_PARTNER_FAIL',
  'INVITE_PARTNER', 'SHOW_CUSTOMER_PANEL',
  'SHOW_VENDOR_MODAL', 'HIDE_VENDOR_MODAL',
]);

const initialState = {
  loading: true,
  loaded: true,
  partnerlist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  partnerFilter: {
    name: undefined,
  },
  partners: [],
  customerModal: {
    visiblePanel: false,
    customer: {},
  },
  vendorModal: {
    visible: false,
    operation: 'add',
    vendor: { role: '' },
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PARTNERLIST:
      return {
        ...state, loading: true, loaded: true, partnerFilter: JSON.parse(action.params.filters),
      };
    case actionTypes.LOAD_PARTNERLIST_SUCCEED:
      return {
        ...state, loading: false, partnerlist: action.result.data,
      };
    case actionTypes.LOAD_PARTNERLIST_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_PARTNERS:
      return { ...state, loaded: true };
    case actionTypes.LOAD_PARTNERS_SUCCEED:
    case actionTypes.LOAD_TYPEPARTNERS_SUCCEED:
      return { ...state, partners: action.result.data };
    case actionTypes.CHANGE_PARTNER_STATUS_SUCCEED:
    case actionTypes.DELETE_PARTNER_SUCCEED:
    case actionTypes.INVITE_PARTNER:
    case actionTypes.ADD_PARTNER_SUCCEED:
    case actionTypes.EDIT_PARTNER_SUCCEED:
      return { ...state, loaded: false };
    case actionTypes.SHOW_CUSTOMER_PANEL:
      return {
        ...state,
        customerModal: {
          ...state.customerModal,
          visiblePanel: action.data.visible,
          customer: action.data.customer || {},
        },
      };
    case actionTypes.SHOW_VENDOR_MODAL: {
      return {
        ...state,
        vendorModal: {
          visible: true,
          ...action.data,
        },
      };
    }
    case actionTypes.HIDE_VENDOR_MODAL: {
      return {
        ...state,
        vendorModal: initialState.vendorModal,
      };
    }
    default:
      return state;
  }
}

export function loadPartnerList(role, pageSize, current, filters) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERLIST,
        actionTypes.LOAD_PARTNERLIST_SUCCEED,
        actionTypes.LOAD_PARTNERLIST_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/list',
      method: 'get',
      params: {
        role, filters, pageSize, current,
      },
    },
  };
}

export function loadPartners(params) { // role businessType
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
      params: {
        tenantId,
        roles: JSON.stringify(roles),
        businessTypes: JSON.stringify(businessTypes),
      },
    },
  };
}

export function addPartner(partnerInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PARTNER,
        actionTypes.ADD_PARTNER_SUCCEED,
        actionTypes.ADD_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/add',
      method: 'post',
      data:
        partnerInfo,
    },
  };
}

export function checkPartner(partnerInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHECK_PARTNER,
        actionTypes.CHECK_PARTNER_SUCCEED,
        actionTypes.CHECK_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/check',
      method: 'post',
      data: partnerInfo,
    },
  };
}

export function editPartner(partnerId, partnerInfo) {
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
      data: { partnerId, partnerInfo },
    },
  };
}

export function changePartnerStatus(id, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHANGE_PARTNER_STATUS,
        actionTypes.CHANGE_PARTNER_STATUS_SUCCEED,
        actionTypes.CHANGE_PARTNER_STATUS_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/change_status',
      method: 'post',
      data: { id, status },
    },
  };
}

export function deletePartner(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_PARTNER,
        actionTypes.DELETE_PARTNER_SUCCEED,
        actionTypes.DELETE_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/partner/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function invitePartner(id) {
  return {
    type: actionTypes.INVITE_PARTNER,
    id,
  };
}

export function showCustomerPanel({ visible, customer }) {
  return { type: actionTypes.SHOW_CUSTOMER_PANEL, data: { visible, customer } };
}

export function showPartnerModal(operation = '', vendor = {}) {
  return { type: actionTypes.SHOW_VENDOR_MODAL, data: { operation, vendor } };
}

export function hidePartnerModal() {
  return { type: actionTypes.HIDE_VENDOR_MODAL };
}
