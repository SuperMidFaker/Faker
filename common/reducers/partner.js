import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { PARTNERSHIP } from 'common/constants';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'PARTNERS_LOAD', 'PARTNERS_LOAD_SUCCEED', 'PARTNERS_LOAD_FAIL',
  'SET_MENU_ITEM_KEY', 'SET_PROVIDER_TYPE',
  'EDIT_PROVIDER_TYPES', 'EDIT_PROVIDER_TYPES_SUCCEED', 'EDIT_PROVIDER_TYPES_FAIL', 'EDIT_PROVIDER_TYPES_LOCAL',
  'ADD_PARTNER', 'ADD_PARTNER_SUCCEED', 'ADD_PARTNER_FAIL',
  'CHANGE_PARTNER_STATUS', 'CHANGE_PARTNER_STATUS_SUCCEED', 'CHANGE_PARTNER_STATUS_FAIL'
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
  },
  recevieablePartnerTenants: [
    /* { id, name, code } */
  ],
  selectedMenuItemKey: '0',  // 记录当前MenuItemKey的值,
  providerType: 'ALL'        // 记录当前被选中的物流供应商, 值对应为:['ALL', 'FWD', 'CCB', 'TRS', 'WHS']
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PARTNERS_LOAD:
      return { ...state, loading: true, };
    case actionTypes.PARTNERS_LOAD_SUCCEED:
      return { ...state, ...action.result.data, loading: false, loaded: true,
        filters: action.params.filters ? JSON.parse(action.params.filters) : [] };
    case actionTypes.PARTNERS_LOAD_FAIL:
      return { ...state, loading: false, loaded: true };
    // above need to refactor
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
      const updatePartnerlist = { ...state.partnerlist, data: [...state.partnerlist.data, newPartner] };
      return { ...state, partnerlist: updatePartnerlist };
    }
    case actionTypes.CHANGE_PARTNER_STATUS_SUCCEED: {
      const { id, status } = action;
      const originPartners = state.partnerlist.data;
      const updatingPartner = originPartners.find(partner => partner.key === id);
      const index = originPartners.findIndex(partner => partner.key === id);
      const updatedPartner = {...updatingPartner, status};
      const allPartners = [...originPartners.slice(0, index), updatedPartner, ...originPartners.slice(index + 1)];
      return { ...state, partnerlist: { ...state.partnerlist, data: allPartners } };
    }
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
