import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { PARTNERSHIP } from 'common/constants';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'SET_MENU_ITEM_KEY', 'SET_PROVIDER_TYPE',
  'EDIT_PROVIDER_TYPES', 'EDIT_PROVIDER_TYPES_SUCCEED', 'EDIT_PROVIDER_TYPES_FAIL', 'EDIT_PROVIDER_TYPES_LOCAL',
  'ADD_PARTNER', 'ADD_PARTNER_SUCCEED', 'ADD_PARTNER_FAIL',
  'EDIT_PARTNER', 'EDIT_PARTNER_SUCCEED', 'EDIT_PARTNER_FAIL',
  'CHANGE_PARTNER_STATUS', 'CHANGE_PARTNER_STATUS_SUCCEED', 'CHANGE_PARTNER_STATUS_FAIL',
  'DELETE_PARTNER', 'DELETE_PARTNER_SUCCEED', 'DELETE_PARTNER_FAIL',
  'INVITE_PARTNER'
]);

const initialState = {
  partnershipTypes: [
    /* { key:, name: count: } */
  ],
  partnerTenants: [
    /* { id:, name: } */
  ],
  partnerlist: [],
  selectedMenuItemKey: '0',  // 记录当前MenuItemKey的值,
  providerType: 'ALL'        // 记录当前被选中的物流供应商, 值对应为:['ALL', 'FWD', 'CCB', 'TRS', 'WHS']
};

function partnerReducer(state, action) {
  const foundPartner = state.find(partner => partner.id === action.id);
  const foundPartnerIndex = state.findIndex(partner => partner.id === action.id);
  switch (action.type) {
    case actionTypes.DELETE_PARTNER_SUCCEED:
      return [...state.slice(0, foundPartnerIndex), ...state.slice(foundPartnerIndex + 1)];
    case actionTypes.CHANGE_PARTNER_STATUS_SUCCEED: {
      const updatedPartner = {...foundPartner, status: action.status};
      return [...state.slice(0, foundPartnerIndex), updatedPartner, ...state.slice(foundPartnerIndex + 1)];
    }
    case actionTypes.EDIT_PARTNER_SUCCEED: {
      const { name, code } = action.editInfo;
      const updatePartner = {...foundPartner, name, partnerCode: code };
      return [...state.slice(0, foundPartnerIndex), updatePartner, ...state.slice(foundPartnerIndex + 1)];
    }
    case actionTypes.INVITE_PARTNER: {
      const invitedPartner = {...foundPartner, invited: 1};
      return [...state.slice(0, foundPartnerIndex), invitedPartner, ...state.slice(foundPartnerIndex + 1)];
    }
    default:
      return state;
  }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, ...action.result.data };
    case actionTypes.SET_MENU_ITEM_KEY:
      return { ...state, selectedMenuItemKey:action.selectedMenuItemKey };
    case actionTypes.SET_PROVIDER_TYPE:
      return { ...state, providerType: action.providerType };
    case actionTypes.EDIT_PROVIDER_TYPES_LOCAL: {
      const key = action.key;
      const providerTypes = action.providerTypes;
      const originPartnerlist = state.partnerlist.data;
      const partnerTenant = originPartnerlist.find(partner => partner.key === key);
      const partnerTenantIndex = originPartnerlist.findIndex(partner => partner.key === key);
      const updatePartnerTenant = { ...partnerTenant, types: providerTypes.map(pType => ({key: PARTNERSHIP[pType], code: pType})) };
      partnerTenant.types = providerTypes.map(pType => ({key: PARTNERSHIP[pType], code: pType}));
      return {
        ...state,
        partnerlist: {
          ...state.partnerlist,
          data: [...originPartnerlist.slice(0, partnerTenantIndex), updatePartnerTenant, ...originPartnerlist.slice(partnerTenantIndex + 1)]
        }
      };
    }
    case actionTypes.ADD_PARTNER_SUCCEED: {
      const { newPartner } = action.result.data;
      return { ...state, partnerlist: [newPartner, ...state.partnerlist] };
    }
    case actionTypes.EDIT_PARTNER_SUCCEED:
    case actionTypes.CHANGE_PARTNER_STATUS_SUCCEED:
    case actionTypes.DELETE_PARTNER_SUCCEED:
    case actionTypes.INVITE_PARTNER:
      return {...state, partnerlist: partnerReducer(state.partnerlist, action)};
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
        actionTypes.LOAD_PARTNERS_FAIL
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params,
      cookie
    }
  };
}

export function setMenuItemKey(selectedMenuItemKey) {
  return {
    type: actionTypes.SET_MENU_ITEM_KEY,
    selectedMenuItemKey
  };
}

export function setProviderType(providerType) {
  return {
    type: actionTypes.SET_PROVIDER_TYPE,
    providerType
  };
}

export function editProviderTypes({partnerKey, tenantId, partnerInfo, providerTypes}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_PROVIDER_TYPES,
        actionTypes.EDIT_PROVIDER_TYPES_SUCCEED,
        actionTypes.EDIT_PROVIDER_TYPES_FAIL
      ],
      endpoint: 'v1/cooperation/partner/edit_provider_types',
      method: 'post',
      data: {
        partnerKey,
        tenantId,
        partnerInfo,
        providerTypes,
      }
    }
  };
}

export function editProviderTypesLocal({key, providerTypes}) {
  return {
    type: actionTypes.EDIT_PROVIDER_TYPES_LOCAL,
    key,
    providerTypes
  };
}

export function addPartner({tenantId, partnerInfo, partnerships}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PARTNER,
        actionTypes.ADD_PARTNER_SUCCEED,
        actionTypes.ADD_PARTNER_FAIL
      ],
      endpoint: 'v1/cooperation/partner/add',
      method: 'post',
      data: {
        tenantId,
        partnerInfo,
        partnerships
      }
    }
  };
}

export function editPartner(partnerId, name, code) {
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
      editInfo: { name, code },
      data: {
        partnerId,
        name,
        code,
      },
    }
  };
}

export function changePartnerStatus(id, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHANGE_PARTNER_STATUS,
        actionTypes.CHANGE_PARTNER_STATUS_SUCCEED,
        actionTypes.CHANGE_PARTNER_STATUS_FAIL
      ],
      endpoint: 'v1/cooperation/partner/change_status',
      method: 'post',
      id,
      status,
      data: {
        id,
        status
      }
    }
  };
}

export function deletePartner(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_PARTNER,
        actionTypes.DELETE_PARTNER_SUCCEED,
        actionTypes.DELETE_PARTNER_FAIL
      ],
      endpoint: 'v1/cooperation/partner/delete',
      method: 'post',
      id,
      data: {
        id,
      }
    }
  };
}

export function invitePartner(id) {
  return {
    type: actionTypes.INVITE_PARTNER,
    id
  };
}
