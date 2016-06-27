import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_DELGLIST', 'LOAD_DELGLIST_SUCCEED', 'LOAD_DELGLIST_FAIL',
  'LOAD_BILLS', 'LOAD_BILLS_SUCCEED', 'LOAD_BILLS_FAIL',
  'LOAD_ENTRIES', 'LOAD_ENTRIES_SUCCEED', 'LOAD_ENTRIES_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'LOAD_COMPREL', 'LOAD_COMPREL_SUCCEED', 'LOAD_COMPREL_FAIL',
]);

const initialState = {
  delgList: {
    loaded: false,
    loading: false,
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  listFilter: {
    declareType: '',
    name: '',
    sortField: '',
    sortOrder: '',
  },
  billHead: {
  },
  billBody: [
  ],
  entries: [
  ],
  params: {
    customs: [],
    tradeModes: [],
    transModes: [],
    trxModes: [],
    tradeCountries: [],
    remissionModes: [],
    ports: [],
    districts: [],
    currencies: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_DELGLIST:
      return { ...state, delgList: { ...state.delgList, loading: true }};
    case actionTypes.LOAD_DELGLIST_SUCCEED:
      return { ...state,
        listFilter: JSON.parse(action.params.filter),
        delgList: {
        ...state.delgList, loaded: true,
        loading: false, ...action.result.data,
      }};
    case actionTypes.LOAD_DELGLIST_FAIL:
      return { ...state, delgList: { ...state.delgList, loading: false }};
    case actionTypes.LOAD_BILLS_SUCCEED:
      return { ...state, billHead: action.result.data.head, billBody: action.result.data.bodys };
    case actionTypes.LOAD_ENTRIES_SUCCEED:
      return { ...state, entries: action.result.data };
    case actionTypes.LOAD_PARAMS_SUCCEED:
      return { ...state, params: action.result.data };
    default:
      return state;
  }
}

export function loadDelgList(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELGLIST,
        actionTypes.LOAD_DELGLIST_SUCCEED,
        actionTypes.LOAD_DELGLIST_FAIL,
      ],
      endpoint: 'v1/cms/delegation/declares',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function loadBills(cookie, delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLS,
        actionTypes.LOAD_BILLS_SUCCEED,
        actionTypes.LOAD_BILLS_FAIL,
      ],
      endpoint: 'v1/cms/declare/bills',
      method: 'get',
      params: { delgNo },
      cookie,
    },
  };
}

export function loadEntries(cookie, delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ENTRIES,
        actionTypes.LOAD_ENTRIES_SUCCEED,
        actionTypes.LOAD_ENTRIES_FAIL,
      ],
      endpoint: 'v1/cms/declare/entries',
      method: 'get',
      params: { delgNo },
      cookie,
    },
  };
}

export function loadCmsParams(cookie) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAMS,
        actionTypes.LOAD_PARAMS_SUCCEED,
        actionTypes.LOAD_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/declare/params',
      method: 'get',
      cookie,
    },
  };
}

export function loadCompRelation(type, ietype, tenantId, code) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_COMPREL,
        actionTypes.LOAD_COMPREL_SUCCEED,
        actionTypes.LOAD_COMPREL_FAIL,
      ],
      endpoint: 'v1/cms/declare/comprelation',
      method: 'get',
      params: { type, ietype, code, tenantId },
    },
  };
}
