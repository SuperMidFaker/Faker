import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/classification/', [
  'LOAD_SYNCS', 'LOAD_SYNCS_SUCCEED', 'LOAD_SYNCS_FAIL',
  'LOAD_CLASBROKERS', 'LOAD_CLASBROKERS_SUCCEED', 'LOAD_CLASBROKERS_FAIL',
  'UPDATE_AUDIT', 'UPDATE_AUDIT_SUCCEED', 'UPDATE_AUDIT_FAIL',
  'RENEW_SHAREE', 'RENEW_SHAREE_SUCCEED', 'RENEW_SHAREE_FAIL',
]);

const initialState = {
  synclist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  shareBrokers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SYNCS_SUCCEED:
      return { ...state, synclist: action.result.data };
    case actionTypes.LOAD_CLASBROKERS_SUCCEED:
      return { ...state, shareBrokers: action.result.data.filter(data => data.partner_tenant_id > 0)
        .map(data => ({ tenant_id: data.partner_tenant_id, name: data.name })) };
    default:
      return state;
  }
}

export function loadSyncList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SYNCS,
        actionTypes.LOAD_SYNCS_SUCCEED,
        actionTypes.LOAD_SYNCS_FAIL,
      ],
      endpoint: 'v1/scv/classification/syncs',
      method: 'get',
      params,
    },
  };
}

export function loadClassificatonBrokers(tenantId, role, businessType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLASBROKERS,
        actionTypes.LOAD_CLASBROKERS_SUCCEED,
        actionTypes.LOAD_CLASBROKERS_FAIL,
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params: { tenantId, role, businessType },
    },
  };
}

export function updateAudit(syncId, audit) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_AUDIT,
        actionTypes.UPDATE_AUDIT_SUCCEED,
        actionTypes.UPDATE_AUDIT_FAIL,
      ],
      endpoint: 'v1/scv/classification/sync/audit',
      method: 'post',
      data: { syncId, audit },
    },
  };
}

export function renewSharees(contribute, sharees) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RENEW_SHAREE,
        actionTypes.RENEW_SHAREE_SUCCEED,
        actionTypes.RENEW_SHAREE_FAIL,
      ],
      endpoint: 'v1/scv/classification/sync/update/sharees',
      method: 'post',
      data: { contribute, sharees },
    },
  };
}
