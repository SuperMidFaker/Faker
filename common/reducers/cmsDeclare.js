import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_DELGLIST', 'LOAD_DELGLIST_SUCCEED', 'LOAD_DELGLIST_FAIL',
  'LOAD_BILLS', 'LOAD_BILLS_SUCCEED', 'LOAD_BILLS_FAIL',
  'LOAD_ENTRIES', 'LOAD_ENTRIES_SUCCEED', 'LOAD_ENTRIES_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'LOAD_COMPREL', 'LOAD_COMPREL_SUCCEED', 'LOAD_COMPREL_FAIL',
  'ADD_NEW_BILL_BODY', 'DEL_BILL_BODY', 'EDIT_BILL_BODY',
  'ADD_BILLBODY', 'ADD_BILLBODY_SUCCEED', 'ADD_BILLBODY_FAIL',
  'DEL_BILLBODY', 'DEL_BILLBODY_SUCCEED', 'DEL_BILLBODY_FAIL',
  'EDIT_BILLBODY', 'EDIT_BILLBODY_SUCCEED', 'EDIT_BILLBODY_FAIL',
  'SAVE_BILLHEAD', 'SAVE_BILLHEAD_SUCCEED', 'SAVE_BILLHEAD_FAIL',
  'ADD_ENTRY', 'SET_TABKEY',
  'ADD_NEW_ENTRY_BODY', 'DEL_ENTRY_BODY', 'EDIT_ENTRY_BODY',
  'SAVE_ENTRYHEAD', 'SAVE_ENTRYHEAD_SUCCEED', 'SAVE_ENTRYHEAD_FAIL',
  'ADD_ENTRYBODY', 'ADD_ENTYBODY_SUCCEED', 'ADD_ENTRYBODY_FAIL',
  'DEL_ENTRYBODY', 'DEL_ENTRYBODY_SUCCEED', 'DEL_ENTRYBODY_FAIL',
  'EDIT_ENTRYBODY', 'EDIT_ENTRYBODY_SUCCEED', 'EDIT_ENTRYBODY_FAIL',
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
  activeTabKey: 'bill',
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
    units: [],
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
      return { ...state, billHead: action.result.data.head, billBody: action.result.data.bodies };
    case actionTypes.LOAD_ENTRIES_SUCCEED:
      return { ...state, entries: action.result.data };
    case actionTypes.LOAD_PARAMS_SUCCEED:
      return { ...state, params: action.result.data };
    case actionTypes.SAVE_BILLHEAD_SUCCEED:
      return { ...state, billHead: { ...state.billHead, bill_no: action.result.data.billNo }};
    case actionTypes.ADD_ENTRY: {
      const copyHead = (head) => {
        const excludes = [
          'id', 'creater_login_id', 'created_date', 'entry_id', 'pre_entry_id',
          'fee_rate', 'insur_rate', 'other_rate', 'pack_count', 'gross_wt', 'net_wt',
        ];
        const headcopy = {};
        for (const key in head) {
          if (Object.hasOwnProperty.call(head, key) && excludes.indexOf(key) < 0) {
            headcopy[key] = head[key];
          }
        }
        return headcopy;
      };
      const prevHead = state.entries.length > 0 ? state.entries[0].head : state.billHead;
      const head = copyHead(prevHead);
      return { ...state, entries: [ ...state.entries, { head, bodies: [] } ], activeTabKey: `entry${state.entries.length}` };
    }
    case actionTypes.SET_TABKEY:
      return { ...state, activeTabKey: action.data };
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

export function addNewBillBody({ body, headNo, loginId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BILLBODY,
        actionTypes.ADD_BILLBODY_SUCCEED,
        actionTypes.ADD_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/declare/billbody/add',
      method: 'post',
      data: { newBody: body, billNo: headNo, loginId },
    },
  };
}

export function delBillBody(bodyId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_BILLBODY,
        actionTypes.DEL_BILLBODY_SUCCEED,
        actionTypes.DEL_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/declare/billbody/del',
      method: 'post',
      data: { bodyId },
    },
  };
}

export function editBillBody(body) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_BILLBODY,
        actionTypes.EDIT_BILLBODY_SUCCEED,
        actionTypes.EDIT_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/declare/billbody/edit',
      method: 'post',
      data: body,
    },
  };
}

export function saveBillHead({ head, ietype, loginId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_BILLHEAD,
        actionTypes.SAVE_BILLHEAD_SUCCEED,
        actionTypes.SAVE_BILLHEAD_FAIL,
      ],
      endpoint: 'v1/cms/declare/billhead',
      method: 'post',
      data: { head, ietype, loginId },
    },
  };
}

export function addEntry() {
  return {
    type: actionTypes.ADD_ENTRY,
  };
}

export function addNewEntryBody({ body, headNo, loginId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_ENTRYBODY,
        actionTypes.ADD_ENTYBODY_SUCCEED,
        actionTypes.ADD_ENTRYBODY_FAIL,
      ],
      endpoint: 'v1/cms/declare/entrybody/add',
      method: 'post',
      data: { newBody: body, headId: headNo, loginId },
    },
  };
}

export function delEntryBody(bodyId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_ENTRYBODY,
        actionTypes.DEL_ENTRYBODY_SUCCEED,
        actionTypes.DEL_ENTRYBODY_FAIL,
      ],
      endpoint: 'v1/cms/declare/entrybody/del',
      method: 'post',
      data: { bodyId },
    },
  };
}

export function editEntryBody(body) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_ENTRYBODY,
        actionTypes.EDIT_ENTRYBODY_SUCCEED,
        actionTypes.EDIT_ENTRYBODY_FAIL,
      ],
      endpoint: 'v1/cms/declare/entrybody/edit',
      method: 'post',
      data: body,
    },
  };
}

export function saveEntryHead({ head, totalCount, loginId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_ENTRYHEAD,
        actionTypes.SAVE_ENTRYHEAD_SUCCEED,
        actionTypes.SAVE_ENTRYHEAD_FAIL,
      ],
      endpoint: 'v1/cms/declare/entryhead',
      method: 'post',
      data: { head, totalCount, loginId },
    },
  };
}

export function setTabKey(activeKey) {
  return {
    type: actionTypes.SET_TABKEY,
    data: activeKey,
  };
}
