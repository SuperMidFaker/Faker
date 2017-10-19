import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/sof/vendors/', [
  'LOAD_VENDORS', 'LOAD_VENDORS_FAIL', 'LOAD_VENDORS_SUCCEED',
  'ADD_VENDOR', 'ADD_VENDOR_FAIL', 'ADD_VENDOR_SUCCEED',
  'EDIT_VENDOR', 'EDIT_VENDOR_FAIL', 'EDIT_VENDOR_SUCCEED',
  'DELETE_VENDOR', 'DELETE_VENDOR_SUCCEED', 'DELETE_VENDOR_FAIL',
  'SHOW_VENDOR_MODAL', 'HIDE_VENDOR_MODAL',
  'LOAD_SUB_VENDORS', 'LOAD_SUB_VENDORS_FAIL', 'LOAD_SUB_VENDORS_SUCCEED',
  'SHOW_SUB_VENDOR_MODAL', 'HIDE_SUB_VENDOR_MODAL',
  'LOAD_VENDOR_FLOWS', 'LOAD_VENDOR_FLOWS_FAIL', 'LOAD_VENDOR_FLOWS_SUCCEED',
  'HIDE_SERVICETEAM_MODAL', 'SHOW_SERVICETEAM_MODAL',
  'LOAD_SERVICETEAM_MEMBERS', 'LOAD_SERVICETEAM_MEMBERS_SUCCEED', 'LOAD_SERVICETEAM_MEMBERS_FAIL',
  'ADD_SERVICETEAM_MEMBERS', 'ADD_SERVICETEAM_MEMBERS_SUCCEED', 'ADD_SERVICETEAM_MEMBERS_FAIL',
  'LOAD_TENANT_USERS', 'LOAD_TENANT_USERS_SUCCEED', 'LOAD_TENANT_USERS_FAIL',
  'LOAD_TRANSPORT_TRAIFFS', 'LOAD_TRANSPORT_TRAIFFS_SUCCEED', 'LOAD_TRANSPORT_TRAIFFS_FAIL',
  'LOAD_CMS_QUOTES', 'LOAD_CMS_QUOTES_SUCCEED', 'LOAD_CMS_QUOTES_FAIL',
  'LOAD_OPERATORS', 'LOAD_OPERATORS_SUCCEED', 'LOAD_OPERATORS_FAIL',
  'LOAD_SERVICETEAM_USERIDS', 'LOAD_SERVICETEAM_USERIDS_SUCCEED', 'LOAD_SERVICETEAM_USERIDS_FAIL',
]);

const initialState = {
  loaded: true,
  loading: false,
  vendors: [],
  subVendors: [],
  serviceTeamMembers: [],
  operators: [],
  formData: {
  },
  vendorModal: {
    visible: false,
    operation: '',
    vendor: {},
  },
  subVendorModal: {
    visible: false,
    operation: '',
    vendor: {},
  },
  serviceTeamModal: {
    visible: false,
    tenantUsers: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_VENDORS:
      return { ...state, loading: true };
    case actionTypes.LOAD_VENDORS_SUCCEED: {
      const vendors = action.result.data.filter(vendor => !vendor.parent_id).map((vendor) => {
        const subVendors = [...action.result.data.filter(cus => cus.parent_id === vendor.id)];
        const children = subVendors.length > 0 ? subVendors : null;
        return { ...vendor, subVendors, children };
      });
      return { ...state, vendors, loaded: true, loading: false };
    }
    case actionTypes.LOAD_VENDORS_FAIL: {
      return { ...state, loading: false };
    }
    case actionTypes.ADD_VENDOR_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.DELETE_VENDOR_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.EDIT_VENDOR_SUCCEED: {
      return { ...state, loaded: false };
    }
    case actionTypes.SHOW_VENDOR_MODAL: {
      return { ...state,
        vendorModal: {
          visible: true,
          ...action.data,
        } };
    }
    case actionTypes.HIDE_VENDOR_MODAL: {
      return { ...state,
        vendorModal: {
          ...initialState.vendorModal,
          visible: false,
        } };
    }
    case actionTypes.LOAD_SUB_VENDORS_SUCCEED: {
      return { ...state, subVendors: action.result.data };
    }
    case actionTypes.SHOW_SUB_VENDOR_MODAL: {
      return { ...state,
        subVendorModal: {
          visible: true,
          ...action.data,
        } };
    }
    case actionTypes.HIDE_SUB_VENDOR_MODAL: {
      return { ...state,
        subVendorModal: {
          ...initialState.subVendorModal,
          visible: false,
        } };
    }
    case actionTypes.HIDE_SERVICETEAM_MODAL: {
      return { ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          visible: false,
        },
      };
    }
    case actionTypes.SHOW_SERVICETEAM_MODAL: {
      return { ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          visible: true,
        } };
    }
    case actionTypes.LOAD_TENANT_USERS_SUCCEED: {
      return { ...state,
        serviceTeamModal: {
          ...state.serviceTeamModal,
          tenantUsers: action.result.data.users,
        },
      };
    }
    case actionTypes.LOAD_SERVICETEAM_MEMBERS_SUCCEED: {
      return { ...state, serviceTeamMembers: action.result.data };
    }
    case actionTypes.LOAD_OPERATORS_SUCCEED: {
      return { ...state, operators: action.result.data };
    }
    default:
      return state;
  }
}

export function loadVendors(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_VENDORS,
        actionTypes.LOAD_VENDORS_SUCCEED,
        actionTypes.LOAD_VENDORS_FAIL,
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params: { tenantId, role: 'SUP' },
    },
  };
}

export function addVendor({ tenantId, partnerInfo, businessType }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_VENDOR,
        actionTypes.ADD_VENDOR_SUCCEED,
        actionTypes.ADD_VENDOR_FAIL,
      ],
      endpoint: 'v1/sof/vendor/add',
      method: 'post',
      data: { tenantId, partnerInfo, businessType },
    },
  };
}

export function editVendor({ tenantId, partnerInfo, businessType }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_VENDOR,
        actionTypes.EDIT_VENDOR_SUCCEED,
        actionTypes.EDIT_VENDOR_FAIL,
      ],
      endpoint: 'v1/sof/vendor/edit',
      method: 'post',
      data: { tenantId, partnerInfo, businessType },
    },
  };
}

export function deleteVendor(id, role) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_VENDOR,
        actionTypes.DELETE_VENDOR_SUCCEED,
        actionTypes.DELETE_VENDOR_FAIL,
      ],
      endpoint: 'v1/sof/vendor/delete',
      method: 'post',
      id,
      data: {
        id, role,
      },
    },
  };
}

export function showVendorModal(operation = '', vendor = {}) {
  return { type: actionTypes.SHOW_VENDOR_MODAL, data: { operation, vendor } };
}

export function hideVendorModal() {
  return { type: actionTypes.HIDE_VENDOR_MODAL };
}

export function loadSubVendors(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SUB_VENDORS,
        actionTypes.LOAD_SUB_VENDORS_SUCCEED,
        actionTypes.LOAD_SUB_VENDORS_FAIL,
      ],
      endpoint: 'v1/sof/subVendors',
      method: 'get',
      params,
    },
  };
}

export function showSubVendorModal(operation = '', vendor = {}) {
  return { type: actionTypes.SHOW_SUB_VENDOR_MODAL, data: { operation, vendor } };
}

export function hideSubVendorModal() {
  return { type: actionTypes.HIDE_SUB_VENDOR_MODAL };
}

export function loadVendorFlows(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_VENDOR_FLOWS,
        actionTypes.LOAD_VENDOR_FLOWS_SUCCEED,
        actionTypes.LOAD_VENDOR_FLOWS_FAIL,
      ],
      endpoint: 'v1/scof/vendor/list/flows',
      method: 'get',
      params,
    },
  };
}

export function showServiceTeamModal() {
  return { type: actionTypes.SHOW_SERVICETEAM_MODAL };
}

export function loadTenantUsers(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TENANT_USERS,
        actionTypes.LOAD_TENANT_USERS_SUCCEED,
        actionTypes.LOAD_TENANT_USERS_FAIL,
      ],
      endpoint: 'v1/user/corp/tenant/users',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function hideServiceTeamModal() {
  return { type: actionTypes.HIDE_SERVICETEAM_MODAL };
}

export function loadServiceTeamMembers(partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SERVICETEAM_MEMBERS,
        actionTypes.LOAD_SERVICETEAM_MEMBERS_SUCCEED,
        actionTypes.LOAD_SERVICETEAM_MEMBERS_FAIL,
      ],
      endpoint: 'v1/scof/vendor/load/serviceTeam/members',
      method: 'get',
      params: { partnerId },
    },
  };
}

export function loadTeamUserIds(partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SERVICETEAM_USERIDS,
        actionTypes.LOAD_SERVICETEAM_USERIDS_SUCCEED,
        actionTypes.LOAD_SERVICETEAM_USERIDS_FAIL,
      ],
      endpoint: 'v1/scof/vendor/load/serviceTeam/userids',
      method: 'get',
      params: { partnerId },
    },
  };
}

export function addServiceTeamMembers(partnerId, userIds) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SERVICETEAM_MEMBERS,
        actionTypes.ADD_SERVICETEAM_MEMBERS_SUCCEED,
        actionTypes.ADD_SERVICETEAM_MEMBERS_FAIL,
      ],
      endpoint: 'v1/scof/vendor/add/serviceTeam/members',
      method: 'post',
      data: { partnerId, userIds },
    },
  };
}

export function loadTransportTariffs(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSPORT_TRAIFFS,
        actionTypes.LOAD_TRANSPORT_TRAIFFS_SUCCEED,
        actionTypes.LOAD_TRANSPORT_TRAIFFS_FAIL,
      ],
      endpoint: 'v1/scof/transport/tariffs',
      method: 'get',
      params: { tenantId },
      origin: 'mongo',
    },
  };
}

export function loadCmsQuotes(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CMS_QUOTES,
        actionTypes.LOAD_CMS_QUOTES_SUCCEED,
        actionTypes.LOAD_CMS_QUOTES_FAIL,
      ],
      endpoint: 'v1/scof/cms/quotes',
      method: 'get',
      params: { tenantId },
      origin: 'mongo',
    },
  };
}

export function loadOperators(partnerId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OPERATORS,
        actionTypes.LOAD_OPERATORS_SUCCEED,
        actionTypes.LOAD_OPERATORS_FAIL,
      ],
      endpoint: 'v1/scof/vendor/operators',
      method: 'get',
      params: { partnerId, tenantId },
    },
  };
}
