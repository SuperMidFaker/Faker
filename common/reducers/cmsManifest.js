import { WRAP_TYPE as PackTypes, DELG_EXEMPTIONWAY } from 'common/constants';
import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/manifest/', [
  'LOAD_BILL', 'LOAD_BILL_SUCCEED', 'LOAD_BILL_FAIL',
  'LOAD_ENTRY', 'LOAD_ENTRY_SUCCEED', 'LOAD_ENTRY_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'LOAD_SEARCHPARAM', 'LOAD_SEARCHPARAM_SUCCEED', 'LOAD_SEARCHPARAM_FAIL',
  'ADD_BILLBODY', 'ADD_BILLBODY_SUCCEED', 'ADD_BILLBODY_FAIL',
  'DEL_BILLBODY', 'DEL_BILLBODY_SUCCEED', 'DEL_BILLBODY_FAIL',
  'EDIT_BILLBODY', 'EDIT_BILLBODY_SUCCEED', 'EDIT_BILLBODY_FAIL',
  'SAVE_BILLHEAD', 'SAVE_BILLHEAD_SUCCEED', 'SAVE_BILLHEAD_FAIL',
  'OPEN_MS_MODAL', 'CLOSE_MS_MODAL',
  'SUBMIT_MERGESPLIT', 'SUBMIT_MERGESPLIT_SUCCEED', 'SUBMIT_MERGESPLIT_FAIL',
]);

const initialState = {
  billMeta: {
    bill_seq_no: '',
    entries: [],
    editable: false,
  },
  billHead: {
  },
  billBodies: [],
  entryHead: {},
  entryBodies: [],
  params: {
    trades: [],
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
    exemptionWays: DELG_EXEMPTIONWAY,
    units: [],
  },
  visibleMSModal: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BILL_SUCCEED: {
      const ports = [...state.params.ports];
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
        ...state, billHead: action.result.data.head, billMeta: action.result.data.meta,
        billBodies: action.result.data.bodies, params: { ...state.params, ports },
      };
    }
    case actionTypes.LOAD_ENTRY_SUCCEED:
      return { ...state, entryHead: action.result.data.head, entryBodies: action.result.data.bodies,
        billMeta: action.result.data.meta };
    case actionTypes.LOAD_PARAMS_SUCCEED: {
      const retParams = action.result.data;
      const retPorts = retParams.ports;
      const newPorts = [...retPorts];
      const originPorts = state.params.ports;
      originPorts.forEach((op) => {
        if (retPorts.filter(rp => rp.port_code === op.port_code).length === 0) {
          newPorts.push(op);
        }
      });
      retParams.ports = newPorts;
      return { ...state, params: { ...state.params, ...retParams } };
    }
    case actionTypes.LOAD_SEARCHPARAM_SUCCEED: {
      const retParam = action.result.data;
      if (retParam.ports) {
        // 合并查找到ports数据至原params中
        const retPorts = retParam.ports;
        const newPorts = [...retPorts];
        const originPorts = state.params.ports;
        originPorts.forEach((op) => {
          if (retPorts.filter(rp => rp.port_code === op.port_code).length === 0) {
            newPorts.push(op);
          }
        });
        retParam.ports = newPorts;
      }
      return { ...state, params: { ...state.params, ...retParam } };
    }
    case actionTypes.SAVE_BILLHEAD_SUCCEED:
      return { ...state, billHead: action.result.data };
    case actionTypes.OPEN_MS_MODAL:
      return { ...state, visibleMSModal: true };
    case actionTypes.CLOSE_MS_MODAL:
      return { ...state, visibleMSModal: false };
    case actionTypes.SUBMIT_MERGESPLIT_SUCCEED:
      return { ...state, billMeta: { ...state.billMeta, entries: action.result.data } };
    default:
      return state;
  }
}

export function loadBill(billSeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL,
        actionTypes.LOAD_BILL_SUCCEED,
        actionTypes.LOAD_BILL_FAIL,
      ],
      endpoint: 'v1/cms/manifest/bill',
      method: 'get',
      params: { billSeqNo },
    },
  };
}

export function loadEntry(billSeqNo, preEntrySeqNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ENTRY,
        actionTypes.LOAD_ENTRY_SUCCEED,
        actionTypes.LOAD_ENTRY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/entry',
      method: 'get',
      params: { billSeqNo, preEntrySeqNo, tenantId },
    },
  };
}

export function loadCmsParams(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAMS,
        actionTypes.LOAD_PARAMS_SUCCEED,
        actionTypes.LOAD_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/manifest/params',
      method: 'get',
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
      endpoint: 'v1/cms/manifest/paramfilters',
      method: 'get',
      params: { paramType, search },
    },
  };
}

export function addNewBillBody({ body, billSeqNo, headNo, loginId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BILLBODY,
        actionTypes.ADD_BILLBODY_SUCCEED,
        actionTypes.ADD_BILLBODY_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billbody/add',
      method: 'post',
      data: { newBody: body, billNo: headNo, billSeqNo, loginId },
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
      endpoint: 'v1/cms/manifest/billbody/del',
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
      endpoint: 'v1/cms/manifest/billbody/edit',
      method: 'post',
      data: body,
    },
  };
}

export function saveBillHead({ head, ietype, loginId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_BILLHEAD,
        actionTypes.SAVE_BILLHEAD_SUCCEED,
        actionTypes.SAVE_BILLHEAD_FAIL,
      ],
      endpoint: 'v1/cms/manifest/billhead',
      method: 'post',
      data: { head, ietype, loginId, tenantId },
    },
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
