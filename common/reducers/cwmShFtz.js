import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/shftz/', [
  'OPEN_BATCH_DECL_MODAL', 'CLOSE_BATCH_DECL_MODAL',
  'ENTRY_REG_LOAD', 'ENTRY_REG_LOAD_SUCCEED', 'ENTRY_REG_LOAD_FAIL',
  'ENTRY_DETAILS_LOAD', 'ENTRY_DETAILS_LOAD_SUCCEED', 'ENTRY_DETAILS_LOAD_FAIL',
  'RELEASE_REG_LOAD', 'RELEASE_REG_LOAD_SUCCEED', 'RELEASE_REG_LOAD_FAIL',
  'PARAMS_LOAD', 'PARAMS_LOAD_SUCCEED', 'PARAMS_LOAD_FAIL',
  'PRODUCT_CARGO_LOAD', 'PRODUCT_CARGO_LOAD_SUCCEED', 'PRODUCT_CARGO_LOAD_FAIL',
  'UPDATE_CARGO_RULE', 'UPDATE_CARGO_RULE_SUCCEED', 'UPDATE_CARGO_RULE_FAIL',
  'SYNC_SKU', 'SYNC_SKU_SUCCEED', 'SYNC_SKU_FAIL',
  'UPDATE_ERFIELD', 'UPDATE_ERFIELD_SUCCEED', 'UPDATE_ERFIELD_FAIL',
  'FILE_ERS', 'FILE_ERS_SUCCEED', 'FILE_ERS_FAIL',
  'QUERY_ERI', 'QUERY_ERI_SUCCEED', 'QUERY_ERI_FAIL',
  'REL_DETAILS_LOAD', 'REL_DETAILS_LOAD_SUCCEED', 'REL_DETAILS_LOAD_FAIL',
  'UPDATE_RRFIELD', 'UPDATE_RRFIELD_SUCCEED', 'UPDATE_RRFIELD_FAIL',
  'FILE_RSO', 'FILE_RSO_SUCCEED', 'FILE_RSO_FAIL',
  'FILE_RTS', 'FILE_RTS_SUCCEED', 'FILE_RTS_FAIL',
  'FILE_RPO', 'FILE_RPO_SUCCEED', 'FILE_RPO_FAIL',
  'QUERY_POI', 'QUERY_POI_SUCCEED', 'QUERY_POI_FAIL',
  'FILE_CARGO', 'FILE_CARGO_SUCCEED', 'FILE_CARGO_FAIL',
  'CONFIRM_CARGO', 'CONFIRM_CARGO_SUCCEED', 'CONFIRM_CARGO_FAIL',
  'LOAD_BALIST', 'LOAD_BALIST_SUCCEED', 'LOAD_BALIST_FAIL',
  'LOAD_PORS', 'LOAD_PORS_SUCCEED', 'LOAD_PORS_FAIL',
  'LOAD_PTDS', 'LOAD_PTDS_SUCCEED', 'LOAD_PTDS_FAIL',
  'BEGIN_BD', 'BEGIN_BD_SUCCEED', 'BEGIN_BD_FAIL',
  'APPLY_DETAILS_LOAD', 'APPLY_DETAILS_LOAD_SUCCEED', 'APPLY_DETAILS_LOAD_FAIL',
  'FILE_BA', 'FILE_BA_SUCCEED', 'FILE_BA_FAIL',
  'MAKE_BAL', 'MAKE_BAL_SUCCEED', 'MAKE_BAL_FAIL',
  'CANCEL_ENR', 'CANCEL_ENR_SUCCEED', 'CANCEL_ENR_FAIL',
  'CANCEL_RER', 'CANCEL_RER_SUCCEED', 'CANCEL_RER_FAIL',
]);

const initialState = {
  batchDeclModal: {
    visible: false,
    ownerCusCode: '',
  },
  portionout_regs: [],
  entryList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  releaseList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  batchApplyList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  cargolist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  cargoRule: {},
  loading: false,
  listFilter: {
    status: 'pending',
    filterNo: '',
    ownerView: 'all',
  },
  entry_asn: {},
  entry_regs: [],
  rel_so: {},
  rel_regs: [],
  batch_decl: {},
  batch_applies: [],
  params: {
    currencies: [],
    units: [],
    tradeCountries: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_BATCH_DECL_MODAL:
      return { ...state, batchDeclModal: { ...state.batchDeclModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_BATCH_DECL_MODAL:
      return { ...state, batchDeclModal: { ...state.batchDeclModal, visible: false } };
    case actionTypes.ENTRY_REG_LOAD_SUCCEED:
      return { ...state, entryList: action.result.data, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.ENTRY_DETAILS_LOAD_SUCCEED:
      return { ...state, ...action.result.data };
    case actionTypes.PARAMS_LOAD_SUCCEED:
      return { ...state, params: action.result.data };
    case actionTypes.RELEASE_REG_LOAD_SUCCEED:
      return { ...state, releaseList: action.result.data, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.PRODUCT_CARGO_LOAD:
      return { ...state, listFilter: JSON.parse(action.params.filter), loading: true };
    case actionTypes.PRODUCT_CARGO_LOAD_SUCCEED:
      return { ...state, cargolist: action.result.data.list, cargoRule: action.result.data.rule, loading: false };
    case actionTypes.UPDATE_ERFIELD_SUCCEED: {
      const regs = state.entry_regs.map((er) => {
        if (er.pre_entry_seq_no === action.data.pre_entry_seq_no) {
          return { ...er, [action.data.field]: action.data.value };
        } else {
          return er;
        }
      });
      return { ...state, entry_regs: regs };
    }
    case actionTypes.REL_DETAILS_LOAD_SUCCEED:
      return { ...state, ...action.result.data };
    case actionTypes.UPDATE_RRFIELD_SUCCEED:
      return { ...state,
        rel_regs: state.rel_regs.map((rr) => {
          if (rr.pre_entry_seq_no === action.data.pre_entry_seq_no) {
            return { ...rr, [action.data.field]: action.data.value };
          } else {
            return rr;
          }
        }) };
    case actionTypes.FILE_RSO_SUCCEED:
    case actionTypes.FILE_RTS_SUCCEED:
    case actionTypes.FILE_RPO_SUCCEED:
      return { ...state,
        rel_so: { ...state.rel_so, reg_status: action.result.data.status },
        rel_regs: state.rel_regs.map(rr => ({ ...rr, ftz_rel_no: action.result.data.preSeqEnts[rr.pre_entry_seq_no] })),
      };
    case actionTypes.LOAD_BALIST:
      return { ...state, listFilter: JSON.parse(action.params.filter), loading: true };
    case actionTypes.LOAD_BALIST_SUCCEED:
      return { ...state, loading: false, batchApplyList: action.result.data };
    case actionTypes.LOAD_BALIST_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_PORS_SUCCEED:
      return { ...state, portionout_regs: action.result.data };
    case actionTypes.APPLY_DETAILS_LOAD_SUCCEED:
      return { ...state, ...action.result.data };
    case actionTypes.FILE_BA_SUCCEED:
      return { ...state, batch_decl: { ...state.batch_decl, status: action.result.data.status } };
    case actionTypes.MAKE_BAL_SUCCEED:
      return { ...state, batch_decl: { ...state.batch_decl, status: action.result.data.status } };
    case actionTypes.CANCEL_ENR_SUCCEED:
      return { ...state, rel_so: { ...state.rel_so, reg_status: action.result.data.status } };
    case actionTypes.CANCEL_RER_SUCCEED:
      return { ...state, entry_asn: { ...state.entry_asn, reg_status: action.result.data.status } };
    default:
      return state;
  }
}

export function openBatchDeclModal(modalInfo) {
  return {
    type: actionTypes.OPEN_BATCH_DECL_MODAL,
    data: modalInfo,
  };
}

export function closeBatchDeclModal() {
  return {
    type: actionTypes.CLOSE_BATCH_DECL_MODAL,
  };
}

export function loadEntryRegDatas(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ENTRY_REG_LOAD,
        actionTypes.ENTRY_REG_LOAD_SUCCEED,
        actionTypes.ENTRY_REG_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entryreg/load',
      method: 'get',
      params,
    },
  };
}

export function loadReleaseRegDatas(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RELEASE_REG_LOAD,
        actionTypes.RELEASE_REG_LOAD_SUCCEED,
        actionTypes.RELEASE_REG_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/releasereg/load',
      method: 'get',
      params,
    },
  };
}

export function loadEntryDetails(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ENTRY_DETAILS_LOAD,
        actionTypes.ENTRY_DETAILS_LOAD_SUCCEED,
        actionTypes.ENTRY_DETAILS_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entryreg/details/load',
      method: 'get',
      params,
    },
  };
}

export function loadParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PARAMS_LOAD,
        actionTypes.PARAMS_LOAD_SUCCEED,
        actionTypes.PARAMS_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/params/load',
      method: 'get',
    },
  };
}

export function loadProductCargo(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PRODUCT_CARGO_LOAD,
        actionTypes.PRODUCT_CARGO_LOAD_SUCCEED,
        actionTypes.PRODUCT_CARGO_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/cargo/load',
      method: 'get',
      params,
    },
  };
}

export function updateCargoRule(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CARGO_RULE,
        actionTypes.UPDATE_CARGO_RULE_SUCCEED,
        actionTypes.UPDATE_CARGO_RULE_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/cargo/rule/update',
      method: 'post',
      data,
    },
  };
}

export function syncProdSKUS(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SYNC_SKU,
        actionTypes.SYNC_SKU_SUCCEED,
        actionTypes.SYNC_SKU_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/cargo/skus/sync',
      method: 'post',
      data,
    },
  };
}

export function updateEntryReg(preRegNo, field, value) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_ERFIELD,
        actionTypes.UPDATE_ERFIELD_SUCCEED,
        actionTypes.UPDATE_ERFIELD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/field/value',
      method: 'post',
      data: { pre_entry_seq_no: preRegNo, field, value },
    },
  };
}

export function fileEntryRegs(asnNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_ERS,
        actionTypes.FILE_ERS_SUCCEED,
        actionTypes.FILE_ERS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/regs/file',
      method: 'post',
      data: { asn_no: asnNo, whse_code: whseCode },
    },
  };
}

export function queryEntryRegInfos(asnNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUERY_ERI,
        actionTypes.QUERY_ERI_SUCCEED,
        actionTypes.QUERY_ERI_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/regs/query',
      method: 'post',
      data: { asn_no: asnNo, whse: whseCode },
    },
  };
}

export function loadRelDetails(soNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REL_DETAILS_LOAD,
        actionTypes.REL_DETAILS_LOAD_SUCCEED,
        actionTypes.REL_DETAILS_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/rel/reg/details',
      method: 'get',
      params: { so_no: soNo },
    },
  };
}

export function updateRelReg(preRegNo, field, value) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RRFIELD,
        actionTypes.UPDATE_RRFIELD_SUCCEED,
        actionTypes.UPDATE_RRFIELD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/field/value',
      method: 'post',
      data: { pre_entry_seq_no: preRegNo, field, value },
    },
  };
}

export function fileRelStockouts(soNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_RSO,
        actionTypes.FILE_RSO_SUCCEED,
        actionTypes.FILE_RSO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/file/stockouts',
      method: 'post',
      data: { so_no: soNo, whse_code: whseCode },
    },
  };
}

export function fileRelTransfers(soNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_RTS,
        actionTypes.FILE_RTS_SUCCEED,
        actionTypes.FILE_RTS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/file/transfers',
      method: 'post',
      data: { so_no: soNo, whse_code: whseCode },
    },
  };
}

export function fileRelPortionouts(soNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_RPO,
        actionTypes.FILE_RPO_SUCCEED,
        actionTypes.FILE_RPO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/file/portionouts',
      method: 'post',
      data: { so_no: soNo, whse_code: whseCode },
    },
  };
}

export function queryPortionoutInfos(soNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUERY_POI,
        actionTypes.QUERY_POI_SUCCEED,
        actionTypes.QUERY_POI_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/portionouts/query',
      method: 'post',
      data: { so_no: soNo, whse: whseCode },
    },
  };
}

export function fileCargos(ownerCusCode, whse) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_CARGO,
        actionTypes.FILE_CARGO_SUCCEED,
        actionTypes.FILE_CARGO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/file/cargos',
      method: 'post',
      data: { owner_cus_code: ownerCusCode, whse },
    },
  };
}

export function confirmCargos(ownerCusCode, whse) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CONFIRM_CARGO,
        actionTypes.CONFIRM_CARGO_SUCCEED,
        actionTypes.CONFIRM_CARGO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/confirm/cargos',
      method: 'post',
      data: { owner_cus_code: ownerCusCode, whse },
    },
  };
}

export function loadBatchApplyList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BALIST,
        actionTypes.LOAD_BALIST_SUCCEED,
        actionTypes.LOAD_BALIST_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/applies',
      method: 'get',
      params,
    },
  };
}

export function loadPortionOutRegs(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PORS,
        actionTypes.LOAD_PORS_SUCCEED,
        actionTypes.LOAD_PORS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/portionouts',
      method: 'get',
      params,
    },
  };
}

export function loadPortionDetails(relNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PTDS,
        actionTypes.LOAD_PTDS_SUCCEED,
        actionTypes.LOAD_PTDS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/portion/details',
      method: 'get',
      params: { rel_no: relNo },
    },
  };
}

export function beginBatchDecl(detailIds, relCounts, owner, loginId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.BEGIN_BD,
        actionTypes.BEGIN_BD_SUCCEED,
        actionTypes.BEGIN_BD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/decl/begin',
      method: 'post',
      data: { detailIds, relCounts, owner, loginId, loginName },
    },
  };
}

export function loadApplyDetails(batchNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.APPLY_DETAILS_LOAD,
        actionTypes.APPLY_DETAILS_LOAD_SUCCEED,
        actionTypes.APPLY_DETAILS_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/apply/details',
      method: 'get',
      params: { batch_no: batchNo },
    },
  };
}

export function fileBatchApply(batchNo, whseCode, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_BA,
        actionTypes.FILE_BA_SUCCEED,
        actionTypes.FILE_BA_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/decl/file',
      method: 'post',
      data: { batchNo, whseCode, loginId },
    },
  };
}

export function makeBatchApplied(batchNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MAKE_BAL,
        actionTypes.MAKE_BAL_SUCCEED,
        actionTypes.MAKE_BAL_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/decl/applied',
      method: 'post',
      data: { batchNo, whseCode },
    },
  };
}

export function cancelEntryReg(asnNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_ENR,
        actionTypes.CANCEL_ENR_SUCCEED,
        actionTypes.CANCEL_ENR_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/reg/cancel',
      method: 'post',
      data: { asnNo, whseCode },
    },
  };
}

export function cancelRelReg(soNo, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_RER,
        actionTypes.CANCEL_RER_SUCCEED,
        actionTypes.CANCEL_RER_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/rel/reg/cancel',
      method: 'post',
      data: { soNo, whseCode },
    },
  };
}
