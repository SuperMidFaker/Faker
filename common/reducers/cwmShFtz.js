import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/shftz/', [
  'SHOW_TRANSFER_IN_MODAL',
  'OPEN_BATCH_DECL_MODAL', 'CLOSE_BATCH_DECL_MODAL',
  'OPEN_CLEARANCE_MODAL', 'CLOSE_CLEARANCE_MODAL',
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
  'PAIR_ERP', 'PAIR_ERP_SUCCEED', 'PAIR_ERP_FAIL',
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
  'BEGIN_NC', 'BEGIN_NC_SUCCEED', 'BEGIN_NC_FAIL',
  'LOAD_NDLIST', 'LOAD_NDLIST_SUCCEED', 'LOAD_NDLIST_FAIL',
  'APPLY_DETAILS_LOAD', 'APPLY_DETAILS_LOAD_SUCCEED', 'APPLY_DETAILS_LOAD_FAIL',
  'FILE_BA', 'FILE_BA_SUCCEED', 'FILE_BA_FAIL',
  'MAKE_BAL', 'MAKE_BAL_SUCCEED', 'MAKE_BAL_FAIL',
  'CANCEL_ENR', 'CANCEL_ENR_SUCCEED', 'CANCEL_ENR_FAIL',
  'CANCEL_RER', 'CANCEL_RER_SUCCEED', 'CANCEL_RER_FAIL',
  'EDIT_GNAME', 'EDIT_GNAME_SUCCEED', 'EDIT_GNAME_FAIL',
  'EDIT_REL_WT', 'EDIT_REL_WT_SUCCEED', 'EDIT_REL_WT_FAIL',
  'TRANSFER_TO_OWN', 'TRANSFER_TO_OWN_SUCCEED', 'TRANSFER_TO_OWN_FAIL',
  'QUERY_OWNTRANF', 'QUERY_OWNTRANF_SUCCEED', 'QUERY_OWNTRANF_FAIL',
  'ENTRY_TRANS_LOAD', 'ENTRY_TRANS_LOAD_SUCCEED', 'ENTRY_TRANS_LOAD_FAIL',
  'LOAD_ETIDS', 'LOAD_ETIDS_SUCCEED', 'LOAD_ETIDS_FAIL',
  'VIRTUAL_TRANS_SAVE', 'VIRTUAL_TRANS_SAVE_SUCCEED', 'VIRTUAL_TRANS_SAVE_FAIL',
  'VIRTUAL_TRANS_DELETE', 'VIRTUAL_TRANS_DELETE_SUCCEED', 'VIRTUAL_TRANS_DELETE_FAIL',
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
]);

const initialState = {
  batchDeclModal: {
    visible: false,
    ownerCusCode: '',
  },
  transInModal: {
    visible: false,
    ownerCusCode: '',
  },
  clearanceModal: {
    visible: false,
    ownerCusCode: '',
  },
  batchout_regs: [],
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
  normalDelgList: {
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
    status: 'all',
    type: 'all',
    filterNo: '',
    ownerView: 'all',
    transType: '',
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
    trxModes: [],
  },
  transRegs: [],
  stockDatas: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_TRANSFER_IN_MODAL:
      return { ...state, transInModal: { ...state.transInModal, ...action.data } };
    case actionTypes.OPEN_BATCH_DECL_MODAL:
      return { ...state, batchDeclModal: { ...state.batchDeclModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_BATCH_DECL_MODAL:
      return { ...state, batchDeclModal: { ...state.batchDeclModal, visible: false } };
    case actionTypes.OPEN_CLEARANCE_MODAL:
      return { ...state, clearanceModal: { ...state.clearanceModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_CLEARANCE_MODAL:
      return { ...state, clearanceModal: { ...state.clearanceModal, visible: false } };
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
    case actionTypes.LOAD_NDLIST:
      return { ...state, listFilter: JSON.parse(action.params.filter), loading: true };
    case actionTypes.LOAD_NDLIST_SUCCEED:
      return { ...state, loading: false, normalDelgList: action.result.data };
    case actionTypes.LOAD_NDLIST_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_BALIST:
      return { ...state, listFilter: JSON.parse(action.params.filter), loading: true };
    case actionTypes.LOAD_BALIST_SUCCEED:
      return { ...state, loading: false, batchApplyList: action.result.data };
    case actionTypes.LOAD_BALIST_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_PORS_SUCCEED:
      return { ...state, batchout_regs: action.result.data };
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
    case actionTypes.ENTRY_TRANS_LOAD_SUCCEED:
      return { ...state, transRegs: action.result.data };
    case actionTypes.LOAD_STOCKS_SUCCEED:
      return { ...state, stockDatas: action.result.data };
    default:
      return state;
  }
}

export function showTransferInModal(data) {
  return {
    type: actionTypes.SHOW_TRANSFER_IN_MODAL,
    data,
  };
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

export function openClearanceModal(modalInfo) {
  return {
    type: actionTypes.OPEN_CLEARANCE_MODAL,
    data: modalInfo,
  };
}

export function closeClearanceModal() {
  return {
    type: actionTypes.CLOSE_CLEARANCE_MODAL,
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

export function updateEntryReg(preRegNo, field, value, virtualTransfer) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_ERFIELD,
        actionTypes.UPDATE_ERFIELD_SUCCEED,
        actionTypes.UPDATE_ERFIELD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/field/value',
      method: 'post',
      data: { pre_entry_seq_no: preRegNo, field, value, virtualTransfer },
    },
  };
}

export function fileEntryRegs(asnNo, whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_ERS,
        actionTypes.FILE_ERS_SUCCEED,
        actionTypes.FILE_ERS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/regs/file',
      method: 'post',
      data: { asn_no: asnNo, whse: whseCode, tenantId },
    },
  };
}

export function queryEntryRegInfos(asnNo, whseCode, customsWhseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUERY_ERI,
        actionTypes.QUERY_ERI_SUCCEED,
        actionTypes.QUERY_ERI_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/regs/query',
      method: 'post',
      data: { asn_no: asnNo, whse: whseCode, customsWhseCode, tenantId },
    },
  };
}

export function cancelEntryReg(asnNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_ENR,
        actionTypes.CANCEL_ENR_SUCCEED,
        actionTypes.CANCEL_ENR_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/reg/cancel',
      method: 'post',
      data: { asnNo },
    },
  };
}

export function pairEntryRegProducts(asnNo, whseCode, customsWhseCode, tenantId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PAIR_ERP,
        actionTypes.PAIR_ERP_SUCCEED,
        actionTypes.PAIR_ERP_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/regs/matchpair',
      method: 'post',
      data: { asn_no: asnNo, whse: whseCode, customsWhseCode, tenantId, loginName },
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

export function fileRelStockouts(soNo, whseCode, customsWhseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_RSO,
        actionTypes.FILE_RSO_SUCCEED,
        actionTypes.FILE_RSO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/file/stockouts',
      method: 'post',
      data: { so_no: soNo, whse_code: whseCode, customsWhseCode, tenantId },
    },
  };
}

export function fileRelTransfers(soNo, whseCode, customsWhseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_RTS,
        actionTypes.FILE_RTS_SUCCEED,
        actionTypes.FILE_RTS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/file/transfers',
      method: 'post',
      data: { so_no: soNo, whse_code: whseCode, customsWhseCode, tenantId },
    },
  };
}

export function fileRelPortionouts(soNo, whseCode, customsWhseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_RPO,
        actionTypes.FILE_RPO_SUCCEED,
        actionTypes.FILE_RPO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/file/portionouts',
      method: 'post',
      data: { so_no: soNo, whse_code: whseCode, customsWhseCode, tenantId },
    },
  };
}

export function queryPortionoutInfos(soNo, whseCode, customsWhseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUERY_POI,
        actionTypes.QUERY_POI_SUCCEED,
        actionTypes.QUERY_POI_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/portionouts/query',
      method: 'post',
      data: { so_no: soNo, whse: whseCode, customsWhseCode, tenantId },
    },
  };
}

export function cancelRelReg(soNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_RER,
        actionTypes.CANCEL_RER_SUCCEED,
        actionTypes.CANCEL_RER_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/rel/reg/cancel',
      method: 'post',
      data: { soNo },
    },
  };
}

export function fileCargos(ownerCusCode, whse, customsWhseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_CARGO,
        actionTypes.FILE_CARGO_SUCCEED,
        actionTypes.FILE_CARGO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/file/cargos',
      method: 'post',
      data: { owner_cus_code: ownerCusCode, whse, customsWhseCode, tenantId },
    },
  };
}

export function confirmCargos(ownerCusCode, whse, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CONFIRM_CARGO,
        actionTypes.CONFIRM_CARGO_SUCCEED,
        actionTypes.CONFIRM_CARGO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/confirm/cargos',
      method: 'post',
      data: { owner_cus_code: ownerCusCode, whse, tenantId },
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

export function loadBatchOutRegs(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PORS,
        actionTypes.LOAD_PORS_SUCCEED,
        actionTypes.LOAD_PORS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/outregs',
      method: 'get',
      params,
    },
  };
}

export function loadBatchRegDetails(relNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PTDS,
        actionTypes.LOAD_PTDS_SUCCEED,
        actionTypes.LOAD_PTDS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/reg/details',
      method: 'get',
      params: { rel_no: relNo },
    },
  };
}

export function beginBatchDecl(detailIds, relCounts, owner, loginId, loginName, groupVals) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.BEGIN_BD,
        actionTypes.BEGIN_BD_SUCCEED,
        actionTypes.BEGIN_BD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/decl/begin',
      method: 'post',
      data: { detailIds, relCounts, owner, loginId, loginName, groupVals },
    },
  };
}

export function beginNormalClear(ietype, detailIds, relCounts, owner, loginId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.BEGIN_NC,
        actionTypes.BEGIN_NC_SUCCEED,
        actionTypes.BEGIN_NC_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/normal/clear/begin',
      method: 'post',
      data: { ietype, detailIds, relCounts, owner, loginId, loginName },
    },
  };
}

export function loadNormalDelgList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_NDLIST,
        actionTypes.LOAD_NDLIST_SUCCEED,
        actionTypes.LOAD_NDLIST_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/normal/delegations',
      method: 'get',
      params,
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

export function fileBatchApply(batchNo, whseCode, loginId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILE_BA,
        actionTypes.FILE_BA_SUCCEED,
        actionTypes.FILE_BA_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/decl/file',
      method: 'post',
      data: { batchNo, whseCode, loginId, tenantId },
    },
  };
}

export function makeBatchApplied(batchNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MAKE_BAL,
        actionTypes.MAKE_BAL_SUCCEED,
        actionTypes.MAKE_BAL_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/batch/decl/applied',
      method: 'post',
      data: { batchNo, tenantId },
    },
  };
}

export function editGname(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_GNAME,
        actionTypes.EDIT_GNAME_SUCCEED,
        actionTypes.EDIT_GNAME_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/gname/edit',
      method: 'post',
      data,
    },
  };
}

export function editReleaseWt(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_REL_WT,
        actionTypes.EDIT_REL_WT_SUCCEED,
        actionTypes.EDIT_REL_WT_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/rel/wt/edit',
      method: 'post',
      data,
    },
  };
}

export function transferToOwnWhse(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.TRANSFER_TO_OWN,
        actionTypes.TRANSFER_TO_OWN_SUCCEED,
        actionTypes.TRANSFER_TO_OWN_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/transfer/to/ownwhse',
      method: 'post',
      data,
    },
  };
}

export function queryOwnTransferOutIn(query) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.QUERY_OWNTRANF,
        actionTypes.QUERY_OWNTRANF_SUCCEED,
        actionTypes.QUERY_OWNTRANF_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/transfer/ownwhse/query',
      method: 'post',
      data: query,
    },
  };
}
export function loadEntryTransRegs(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ENTRY_TRANS_LOAD,
        actionTypes.ENTRY_TRANS_LOAD_SUCCEED,
        actionTypes.ENTRY_TRANS_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entryreg/transferIn/load',
      method: 'get',
      params,
    },
  };
}

export function loadEntryTransInDetails(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ETIDS,
        actionTypes.LOAD_ETIDS_SUCCEED,
        actionTypes.LOAD_ETIDS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entry/transfer/in/reg/details',
      method: 'get',
      params,
    },
  };
}

export function saveVirtualTransfer(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.VIRTUAL_TRANS_SAVE,
        actionTypes.VIRTUAL_TRANS_SAVE_SUCCEED,
        actionTypes.VIRTUAL_TRANS_SAVE_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/virtual/transfer/save',
      method: 'post',
      data,
    },
  };
}

export function deleteVirtualTransfer(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.VIRTUAL_TRANS_DELETE,
        actionTypes.VIRTUAL_TRANS_DELETE_SUCCEED,
        actionTypes.VIRTUAL_TRANS_DELETE_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/virtual/transfer/delete',
      method: 'post',
      data,
    },
  };
}

export function loadFtzStocks(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOCKS,
        actionTypes.LOAD_STOCKS_SUCCEED,
        actionTypes.LOAD_STOCKS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/details/get',
      method: 'get',
      params,
    },
  };
}

