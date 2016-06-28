import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_DELGLIST', 'LOAD_DELGLIST_SUCCEED', 'LOAD_DELGLIST_FAIL',
  'LOAD_BILLS', 'LOAD_BILLS_SUCCEED', 'LOAD_BILLS_FAIL',
  'LOAD_ENTRIES', 'LOAD_ENTRIES_SUCCEED', 'LOAD_ENTRIES_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'LOAD_COMPREL', 'LOAD_COMPREL_SUCCEED', 'LOAD_COMPREL_FAIL',
  'ADD_NEW_BILL_BODY', 'DEL_BILL_BODY', 'EDIT_BILL_BODY',
  'SAVE_BILL', 'SAVE_BILL_SUCCEED', 'SAVE_BILL_FAIL',
  'ADD_ENTRY'
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
  billBodyCreated: [],
  billBodyDeleted: [],
  billBodyEdited: [],
  entries: [
  ],
  entryBodyCreated: [],
  entryBodyDeleted: [],
  entryBodyEdited: [],
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
    case actionTypes.ADD_NEW_BILL_BODY: {
      const created = [ ...state.billBodyCreated ];
      let found = false;
      for (let i = 0; i < created.length; i++) {
        // 已经添加对象的修改
        if (created[i].list_g_no === action.data.list_g_no) {
          created[i] = { ...action.data };
          created[i].id = undefined;
          found = true;
          break;
        }
      }
      if (!found) {
        created.push(action.data);
      }
      return { ...state, billBodyCreated: created };
    }
    case actionTypes.DEL_BILL_BODY:
      return { ...state, billBodyDeleted: [ ...state.billBodyDeleted, action.data ]};
    case actionTypes.EDIT_BILL_BODY:
      return { ...state, billBodyEdited: [ ...state.billBodyEdited, action.data ]};
    case actionTypes.ADD_ENTRY:
      return { ...state, entries: [ ...state.entries, state.entries[0] || state.billHead ]};
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

export function addNewBillBody(newBody) {
  return {
    type: actionTypes.ADD_NEW_BILL_BODY,
    data: newBody,
  };
}

export function delBillBody(bodyId) {
  return {
    type: actionTypes.DEL_BILL_BODY,
    data: bodyId,
  };
}

export function editBillBody(body) {
  return {
    type: actionTypes.EDIT_BILL_BODY,
    data: body,
  };
}

export function saveBill(head, newBodys, editBodys, delBodys, ietype, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_BILL,
        actionTypes.SAVE_BILL_SUCCEED,
        actionTypes.SAVE_BILL_FAIL,
      ],
      endpoint: 'v1/cms/declare/bill',
      method: 'post',
      data: { head, newBodys, editBodys, delBodys, ietype, loginId },
    },
  };
}

export function addEntry() {
  return {
    type: actionTypes.ADD_ENTRY,
  };
}
