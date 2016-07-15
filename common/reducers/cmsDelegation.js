import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/cmsDelegation/', [
  'LOAD_ACCEPT', 'LOAD_ACCEPT_SUCCEED', 'LOAD_ACCEPT_FAIL',
  'ACPT_DELG', 'ACPT_DELG_SUCCEED', 'ACPT_DELG_FAIL',
  'CREATE_DELGCCB', 'CREATE_DELGCCB_SUCCEED', 'CREATE_DELGCCB_FAIL',
  'LOAD_DELG', 'LOAD_DELG_SUCCEED', 'LOAD_DELG_FAIL',
  'EDIT_DELGCCB', 'EDIT_DELGCCB_SUCCEED', 'EDIT_DELGCCB_FAIL',
  'SET_CLIENT_FORM', 'NEW_FORM',
  'SEARCH_PARAM', 'SEARCH_PARAM_SUCCEED', 'SEARCH_PARAM_FAIL',
  'DEL_DELG', 'DEL_DELG_SUCCEED', 'DEL_DELG_FAIL',
  'LOAD_REQUIRE', 'LOAD_REQUIRE_SUCCEED', 'LOAD_REQUIRE_FAIL',
]);

const initialState = {
  delegationlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'unaccepted',
  },
  formRequire: {
    clients: [],
    tradeModes: [],
    transModes: [],
    declareWayModes: [],
  },
  formData: {
    customer_tenant_id: -1,
    customer_partner_id: -1,
    create_time: null,
  },
  delgFiles: [],
  submitting: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ACCEPT:
      return { ...state, delegationlist: { ...state.delegationlist, loading: true } };
    case actionTypes.LOAD_ACCEPT_SUCCEED:
      return { ...state, delegationlist: { ...state.delegationlist, loading: false,
        ...action.result.data }, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_ACCEPT_FAIL:
      return { ...state, delegationlist: { ...state.delegationlist, loading: false } };
    case actionTypes.LOAD_DELG:
      return { ...state, formData: initialState.formData, delgFiles: [] };
    case actionTypes.LOAD_DELG_SUCCEED:
      return { ...state, formData: action.result.data.delegation,
        delgFiles: action.result.data.files, formRequire: action.result.data.formRequire,
      };
    case actionTypes.SEARCH_PARAM_SUCCEED:
      return { ...state, formRequire: { ...state.formRequire, ...action.result.data } };
    case actionTypes.SET_CLIENT_FORM:
      return { ...state, formData: { ...state.formData, ...action.data } };
    case actionTypes.NEW_FORM:
      return { ...state, formData: { ...initialState.formData, create_time: new Date() } };
    case actionTypes.LOAD_REQUIRE_SUCCEED:
      return { ...state, formRequire: action.result.data };
    case actionTypes.CREATE_DELGCCB:
    case actionTypes.EDIT_DELGCCB:
      return { ...state, submitting: true };
    case actionTypes.EDIT_DELGCCB_SUCCEED:
    case actionTypes.CREATE_DELGCCB_SUCCEED:
    case actionTypes.EDIT_DELGCCB_FAIL:
    case actionTypes.CREATE_DELGCCB_FAIL:
      return { ...state, submitting: false };
    default:
      return state;
  }
}

export function loadAcceptanceTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ACCEPT,
        actionTypes.LOAD_ACCEPT_SUCCEED,
        actionTypes.LOAD_ACCEPT_FAIL,
      ],
      endpoint: 'v1/cms/acceptance/delegations',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function acceptDelg(loginId, loginName, dispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACPT_DELG,
        actionTypes.ACPT_DELG_SUCCEED,
        actionTypes.ACPT_DELG_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/cms/delegation/accept',
      data: { loginId, loginName, dispId },
    },
  };
}

export function createDelegationByCCB({
  delegation, tenantId, loginId, username,
  ietype, source, tenantName, attachments,
  accepted,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_DELGCCB,
        actionTypes.CREATE_DELGCCB_SUCCEED,
        actionTypes.CREATE_DELGCCB_FAIL,
      ],
      endpoint: 'v1/cms/ccb/delegation',
      method: 'post',
      data: {
        delegation, tenantId, loginId, username,
        ietype, source, tenantName, attachments,
        accepted,
      },
    },
  };
}

export function loadDelg(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELG,
        actionTypes.LOAD_DELG_SUCCEED,
        actionTypes.LOAD_DELG_FAIL,
      ],
      endpoint: 'v1/cms/ccb/delegation',
      method: 'get',
      cookie,
      params,
    },
  };
}

export function editDelegationByCCB({
  delegation, addedFiles, removedFiles, accepted,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_DELGCCB,
        actionTypes.EDIT_DELGCCB_SUCCEED,
        actionTypes.EDIT_DELGCCB_FAIL,
      ],
      endpoint: 'v1/cms/ccb/delegation/edit',
      method: 'post',
      data: {
        delegation, addedFiles, removedFiles, accepted,
      },
    },
  };
}

export function setClientForm({ customer_tenant_id, customer_partner_id }) {
  return {
    type: actionTypes.SET_CLIENT_FORM,
    data: { customer_tenant_id, customer_partner_id },
  };
}

export function searchParams(field, searched, tenantId, ieType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_PARAM,
        actionTypes.SEARCH_PARAM_SUCCEED,
        actionTypes.SEARCH_PARAM_FAIL,
      ],
      endpoint: 'v1/cms/delegation/params',
      method: 'get',
      params: { tenantId, searched, field, ieType },
    },
  };
}

export function delDelg(delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_DELG,
        actionTypes.DEL_DELG_SUCCEED,
        actionTypes.DEL_DELG_FAIL,
      ],
      endpoint: 'v1/cms/delegation/del',
      method: 'post',
      data: { delgNo },
    },
  };
}

export function loadNewForm() {
  return {
    type: actionTypes.NEW_FORM,
  };
}

export function loadFormRequire(cookie, tenantId, ieType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REQUIRE,
        actionTypes.LOAD_REQUIRE_SUCCEED,
        actionTypes.LOAD_REQUIRE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/form/requires',
      method: 'get',
      params: { tenantId, ieType },
      cookie,
    },
  };
}
