import { WRAP_TYPE as PackTypes } from 'common/constants';
import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_DELGLIST', 'LOAD_DELGLIST_SUCCEED', 'LOAD_DELGLIST_FAIL',
  'LOAD_BILLS', 'LOAD_BILLS_SUCCEED', 'LOAD_BILLS_FAIL',
  'LOAD_ENTRIES', 'LOAD_ENTRIES_SUCCEED', 'LOAD_ENTRIES_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'LOAD_SEARCHPARAM', 'LOAD_SEARCHPARAM_SUCCEED', 'LOAD_SEARCHPARAM_FAIL',
  'ADD_NEW_BILL_BODY', 'DEL_BILL_BODY', 'EDIT_BILL_BODY',
  'ADD_BILLBODY', 'ADD_BILLBODY_SUCCEED', 'ADD_BILLBODY_FAIL',
  'DEL_BILLBODY', 'DEL_BILLBODY_SUCCEED', 'DEL_BILLBODY_FAIL',
  'EDIT_BILLBODY', 'EDIT_BILLBODY_SUCCEED', 'EDIT_BILLBODY_FAIL',
  'SAVE_BILLHEAD', 'SAVE_BILLHEAD_SUCCEED', 'SAVE_BILLHEAD_FAIL',
  'ADD_ENTRY', 'SET_TABKEY', 'CLOSE_MS_MODAL', 'OPEN_MS_MODAL',
  'ADD_NEW_ENTRY_BODY', 'DEL_ENTRY_BODY', 'EDIT_ENTRY_BODY',
  'SAVE_ENTRYHEAD', 'SAVE_ENTRYHEAD_SUCCEED', 'SAVE_ENTRYHEAD_FAIL',
  'DEL_ENTRY', 'DEL_ENTRY_SUCCEED', 'DEL_ENTRY_FAIL',
  'ADD_ENTRYBODY', 'ADD_ENTYBODY_SUCCEED', 'ADD_ENTRYBODY_FAIL',
  'DEL_ENTRYBODY', 'DEL_ENTRYBODY_SUCCEED', 'DEL_ENTRYBODY_FAIL',
  'EDIT_ENTRYBODY', 'EDIT_ENTRYBODY_SUCCEED', 'EDIT_ENTRYBODY_FAIL',
  'SUBMIT_MERGESPLIT', 'SUBMIT_MERGESPLIT_SUCCEED', 'SUBMIT_MERGESPLIT_FAIL',
  'OPEN_EF_MODAL', 'CLOSE_EF_MODAL',
  'FILL_ENTRYNO', 'FILL_ENTRYNO_SUCCEED', 'FILL_ENTRYNO_FAIL',
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
    forwarders: [],
    owners: [],
    agents: [],
    customs: [],
    tradeModes: [],
    transModes: [],
    trxModes: [],
    tradeCountries: [],
    remissionModes: [],
    ports: [],
    districts: [],
    currencies: [],
    packs: PackTypes,
    units: [],
  },
  visibleMSModal: false,
  visibleEfModal: false,
  efModal: {
    entryHeadId: -1,
    delgNo: '',
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
    case actionTypes.LOAD_BILLS_SUCCEED: {
      const ports = [ ...state.params.ports ];
      const iePort = action.result.data.iePort;
      const destPort = action.result.data.destPort;
      if (iePort &&
        ports.filter(prt => prt.port_code === iePort.port_code).length === 0) {
        ports.push(iePort);
      }
      if (destPort &&
        ports.filter(prt => prt.port_code === destPort.port_code).length === 0) {
        ports.push(destPort);
      }
      return {
        ...state, billHead: action.result.data.head,
        billBody: action.result.data.bodies, params: { ...state.params, ports },
      };
    }
    case actionTypes.LOAD_ENTRIES_SUCCEED:
      return { ...state, entries: action.result.data };
    case actionTypes.LOAD_PARAMS_SUCCEED: {
      const retParams = action.result.data;
      const retPorts = retParams.ports;
      const newPorts = [ ...retPorts ];
      const originPorts = state.params.ports;
      originPorts.forEach(op => {
        if (retPorts.filter(rp => rp.port_code === op.port_code).length === 0) {
          newPorts.push(op);
        }
      });
      retParams.ports = newPorts;
      return { ...state, params: action.result.data };
    }
    case actionTypes.LOAD_SEARCHPARAM_SUCCEED: {
      const retParam = action.result.data;
      if (retParam.ports) {
        // 合并查找到ports数据至原params中
        const retPorts = retParam.ports;
        const newPorts = [ ...retPorts ];
        const originPorts = state.params.ports;
        originPorts.forEach(op => {
          if (retPorts.filter(rp => rp.port_code === op.port_code).length === 0) {
            newPorts.push(op);
          }
        });
        retParam.ports = newPorts;
      }
      return { ...state, params: { ...state.params, ...retParam }};
    }
    case actionTypes.SAVE_BILLHEAD_SUCCEED:
      return { ...state, billHead: action.result.data };
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
      return {
        ...state, entries: [ ...state.entries, { head, bodies: [] } ],
        activeTabKey: `entry${state.entries.length}`
      };
    }
    case actionTypes.DEL_ENTRY_SUCCEED: {
      const entries = [ ...state.entries ];
      entries.splice(action.index, 1);
      return { ...state, entries };
    }
    case actionTypes.SET_TABKEY:
      return { ...state, activeTabKey: action.data };
    case actionTypes.OPEN_MS_MODAL:
      return { ...state, visibleMSModal: true, };
    case actionTypes.CLOSE_MS_MODAL:
      return { ...state, visibleMSModal: false, };
    case actionTypes.SUBMIT_MERGESPLIT_SUCCEED:
      return { ...state, entries: action.result.data };
    case actionTypes.OPEN_EF_MODAL:
      return { ...state, visibleEfModal: true, efModal: action.data };
    case actionTypes.CLOSE_EF_MODAL:
      return { ...state, visibleEfModal: false, efModal: initialState.efModal };
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

export function loadCmsParams(cookie, params) {
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
      params,
    },
  };
}

export function loadSearchedParam({ paramType, search }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SEARCHPARAM,
        actionTypes.LOAD_SEARCHPARAM_SUCCEED,
        actionTypes.LOAD_SEARCHPARAM_FAIL,
      ],
      endpoint: 'v1/cms/declare/paramfilters',
      method: 'get',
      params: { paramType, search },
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

export function delEntry(headId, index) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_ENTRY,
        actionTypes.DEL_ENTRY_SUCCEED,
        actionTypes.DEL_ENTRY_FAIL,
      ],
      endpoint: 'v1/cms/declare/entry/del',
      method: 'post',
      data: { headId },
      index
    },
  };
}

export function setTabKey(activeKey) {
  return {
    type: actionTypes.SET_TABKEY,
    data: activeKey,
  };
}

export function openMergeSplitModal() {
  return {
    type: actionTypes.OPEN_MS_MODAL,
  };
}

export function closeMergeSplitModal() {
  return {
    type: actionTypes.CLOSE_MS_MODAL,
  };
}

export function submitBillMegeSplit({ billNo, mergeOpt, splitOpt, sortOpt }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_MERGESPLIT,
        actionTypes.SUBMIT_MERGESPLIT_SUCCEED,
        actionTypes.SUBMIT_MERGESPLIT_FAIL,
      ],
      endpoint: 'v1/cms/declare/bill/mergesplit',
      method: 'post',
      data: { billNo, mergeOpt, splitOpt, sortOpt },
    },
  };
}

export function openEfModal({ entryHeadId, delgNo }) {
  return {
    type: actionTypes.OPEN_EF_MODAL,
    data: { entryHeadId, delgNo },
  };
}

export function closeEfModal() {
  return {
    type: actionTypes.CLOSE_EF_MODAL,
  };
}

export function fillEntryNo({ entryNo, entryHeadId, delgNo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILL_ENTRYNO,
        actionTypes.FILL_ENTRYNO_SUCCEED,
        actionTypes.FILL_ENTRYNO_FAIL,
      ],
      endpoint: 'v1/cms/declare/entry/fillno',
      method: 'post',
      data: { entryNo, entryHeadId, delgNo },
    },
  };
}
