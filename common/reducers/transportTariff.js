import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tariff/', [
  'LOAD_TARIFFS', 'LOAD_TARIFFS_SUCCEED', 'LOAD_TARIFFS_FAIL',
  'LOAD_TARIFF', 'LOAD_TARIFF_SUCCEED', 'LOAD_TARIFF_FAIL',
  'DEL_TARIFF', 'DEL_TARIFF_SUCCEED', 'DEL_TARIFF_FAIL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_FORMPARAMS', 'LOAD_FORMPARAMS_SUCCEED', 'LOAD_FORMPARAMS_FAIL',
  'SUBMIT_AGREEMENT', 'SUBMIT_AGREEMENT_SUCCEED', 'SUBMIT_AGREEMENT_FAIL',
  'UPDATE_AGREEMENT', 'UPDATE_AGREEMENT_SUCCEED', 'UPDATE_AGREEMENT_FAIL',
  'SUBMIT_RATESRC', 'SUBMIT_RATESRC_SUCCEED', 'SUBMIT_RATESRC_FAIL',
  'LOAD_RATESRC', 'LOAD_RATESRC_SUCCEED', 'LOAD_RATESRC_FAIL',
  'UPDATE_RATESRC', 'UPDATE_RATESRC_SUCCEED', 'UPDATE_RATESRC_FAIL',
  'DEL_RATESRC', 'DEL_RATESRC_SUCCEED', 'DEL_RATESRC_FAIL',
  'LOAD_RATENDS', 'LOAD_RATENDS_SUCCEED', 'LOAD_RATENDS_FAIL',
  'SUBMIT_RATEND', 'SUBMIT_RATEND_SUCCEED', 'SUBMIT_RATEND_FAIL',
  'UPDATE_RATEND', 'UPDATE_RATEND_SUCCEED', 'UPDATE_RATEND_FAIL',
  'DEL_RATEND', 'DEL_RATEND_SUCCEED', 'DEL_RATEND_FAIL',
  'LOAD_NEW_FORM',
  'CREATE_FEE', 'CREATE_FEE_SUCCEED', 'CREATE_FEE_FAIL',
  'DELETE_FEE', 'DELETE_FEE_SUCCEED', 'DELETE_FEE_FAIL',
  'UPDATE_FEE', 'UPDATE_FEE_SUCCEED', 'UPDATE_FEE_FAIL',
  'UPDATE_TARIFF_VALID', 'UPDATE_TARIFF_VALID_SUCCEED', 'UPDATE_TARIFF_VALID_FAIL',
  'PUBLISH_TARIFF', 'PUBLISH_TARIFF_SUCCEED', 'PUBLISH_TARIFF_FAIL',
  'SHOW_CREATE_TARIFF_MODAL',
  'SHOW_PUBLISH_TARIFF_MODAL',
  'CHANGE_TARIFF',
  'CREATE_TARIFF_BY_NEXT_VERSION', 'CREATE_TARIFF_BY_NEXT_VERSION_SUCCEED', 'CREATE_TARIFF_BY_NEXT_VERSION_FAIL',
  'RESTORE_TARIFF', 'RESTORE_TARIFF_SUCCEED', 'RESTORE_TARIFF_FAIL',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: { name: [], kind: ['all'], status: ['current'] },
  tarifflist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  tariffId: '',
  tariffSaving: false,
  agreement: {
    quoteNo: '',
    version: 0,
    intervals: [],
    vehicleTypes: [],
    kind: -1,
    adjustCoefficient: 1,
    revisions: [],
    taxrate: { mode: 0, value: 0 },
    priceChanged: false,
    accurateMatch: false,
  },
  ratesRefAgreement: {},
  ratesSourceLoading: false,
  ratesSourceList: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  rateId: '',
  ratesEndLoading: false,
  ratesEndList: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    searchValue: '',
  },
  partners: [],
  formParams: {
    transModes: [],
    vehicleTypeParams: [],
    vehicleLengthParams: [],
  },
  fees: [],
  createTariffModal: {
    visible: false,
  },
  publishTariffModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TARIFFS:
      return { ...state, loading: true };
    case actionTypes.LOAD_TARIFFS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TARIFFS_SUCCEED:
      return {
        ...state,
        loading: false,
        loaded: true,
        tarifflist: action.result.data,
        filters: JSON.parse(action.params.filters),
      };
    case actionTypes.LOAD_NEW_FORM:
      return {
        ...state,
        createTariffModal: { ...state.createTariffModal, visible: false },
        agreement: { ...initialState.agreement, ...action.data },
        ratesRefAgreement: initialState.agreement,
        tariffId: null,
        ratesSourceList: initialState.ratesSourceList,
        rateId: initialState.rateId,
        ratesEndList: initialState.ratesEndList,
        fees: [],
      };
    case actionTypes.LOAD_TARIFF:
      return { ...state, agreement: initialState.agreement };
    case actionTypes.LOAD_TARIFF_SUCCEED: {
      const tariff = action.result.data.tariff;
      const res = action.result.data.tariff.agreement;
      const agreement = {
        ...state.agreement,
        id: tariff._id,
        kind: res.kind,
        partnerId: res.partnerId,
        partnerName: res.partnerName,
        transModeCode: res.transModeCode,
        goodsType: res.goodsType,
        meter: res.meter,
        intervals: res.intervals,
        vehicleTypes: res.vehicleTypes,
        adjustCoefficient: res.adjustCoefficient,
        quoteNo: tariff.quoteNo,
        version: tariff.version,
        partnerPermission: tariff.partnerPermission,
        revisions: action.result.data.revisions,
        taxrate: res.taxrate || initialState.agreement.taxrate,
        accurateMatch: tariff.accurateMatch,
      };
      const partners = res.partnerId ? [{
        partner_code: '',
        partner_id: res.partnerId,
        name: res.partnerName,
        tid: 0,
      }] : [];
      return {
        ...state,
        agreement,
        partners,
        ratesRefAgreement: agreement,
        tariffId: action.result.data.tariff._id,
        ratesSourceList: {
          ...state.ratesSourceList,
          ...action.result.data.ratesSourceList,
        },
        rateId: action.result.data.ratesSourceList.data.length > 0 ? action.result.data.ratesSourceList.data[0]._id : '',
        ratesEndList: {
          ...state.ratesEndList,
          ...action.result.data.ratesEndList,
        },
        fees: action.result.data.tariff.fees,
      };
    }
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, partners: action.result.data };
    case actionTypes.LOAD_FORMPARAMS_SUCCEED:
      return { ...state, formParams: action.result.data };
    case actionTypes.SUBMIT_AGREEMENT:
    case actionTypes.UPDATE_AGREEMENT:
      return { ...state, tariffSaving: true };
    case actionTypes.SUBMIT_AGREEMENT_FAIL:
    case actionTypes.UPDATE_AGREEMENT_SUCCEED:
    case actionTypes.UPDATE_AGREEMENT_FAIL:
      return { ...state, tariffSaving: false };
    case actionTypes.SUBMIT_AGREEMENT_SUCCEED:
      return {
        ...state,
        tariffId: action.result.data.tariffId,
        fees: action.result.data.fees,
        ratesRefAgreement: action.data,
        tariffSaving: false,
        agreement: { ...state.agreement, quoteNo: action.result.data.quoteNo },
      };
    case actionTypes.LOAD_RATESRC:
      return { ...state, ratesSourceLoading: true };
    case actionTypes.LOAD_RATESRC_SUCCEED:
      return {
        ...state,
        ratesSourceLoading: false,
        ratesSourceList: action.result.data,
        rateId: '',
        ratesEndList: initialState.ratesEndList,
      };
    case actionTypes.LOAD_RATESRC_FAIL:
      return { ...state, ratesSourceLoading: false };
    case actionTypes.SUBMIT_RATESRC_SUCCEED:
      return { ...state, rateId: action.result.data.id };
    case actionTypes.DEL_RATESRC_SUCCEED:
      return { ...state, rateId: '', ratesEndList: initialState.ratesEndList };
    case actionTypes.LOAD_RATENDS:
      return { ...state, ratesEndLoading: true };
    case actionTypes.LOAD_RATENDS_SUCCEED:
      return {
        ...state,
        ratesEndLoading: false,
        rateId: action.params.rateId,
        ratesEndList: action.result.data,
      };
    case actionTypes.LOAD_RATENDS_FAIL:
      return { ...state, ratesEndLoading: false };
    case actionTypes.CREATE_FEE_SUCCEED:
      return { ...state, fees: action.result.data };
    case actionTypes.SHOW_CREATE_TARIFF_MODAL: {
      return { ...state, createTariffModal: action.data };
    }
    case actionTypes.SHOW_PUBLISH_TARIFF_MODAL: {
      return { ...state, publishTariffModal: action.data };
    }
    case actionTypes.CHANGE_TARIFF: {
      return { ...state, agreement: { ...state.agreement, ...action.data } };
    }
    default:
      return state;
  }
}

export function loadTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TARIFFS,
        actionTypes.LOAD_TARIFFS_SUCCEED,
        actionTypes.LOAD_TARIFFS_FAIL,
      ],
      endpoint: 'v1/transport/tariffs',
      method: 'get',
      params,
      origin: 'mongo',
    },
  };
}

export function loadTariff({
  quoteNo, version, tenantId, status,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TARIFF,
        actionTypes.LOAD_TARIFF_SUCCEED,
        actionTypes.LOAD_TARIFF_FAIL,
      ],
      endpoint: 'v1/transport/tariff',
      method: 'get',
      params: {
        quoteNo, version, tenantId, status,
      },
      origin: 'mongo',
    },
  };
}

export function delTariffById(tariffId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_TARIFF,
        actionTypes.DEL_TARIFF_SUCCEED,
        actionTypes.DEL_TARIFF_FAIL,
      ],
      endpoint: 'v1/transport/del/tariff/byId',
      method: 'post',
      data: { tariffId },
      origin: 'mongo',
    },
  };
}

export function delTariffByQuoteNo(quoteNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_TARIFF,
        actionTypes.DEL_TARIFF_SUCCEED,
        actionTypes.DEL_TARIFF_FAIL,
      ],
      endpoint: 'v1/transport/del/tariff/byQuoteNo',
      method: 'post',
      data: { quoteNo, tenantId },
      origin: 'mongo',
    },
  };
}

export function loadPartners(tenantId, roles, businessTypes) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, roles: JSON.stringify(roles), businessTypes: JSON.stringify(businessTypes) },
    },
  };
}

export function loadNewForm(data) {
  return {
    type: actionTypes.LOAD_NEW_FORM,
    data,
  };
}

export function loadFormParams(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FORMPARAMS,
        actionTypes.LOAD_FORMPARAMS_SUCCEED,
        actionTypes.LOAD_FORMPARAMS_FAIL,
      ],
      endpoint: 'v1/transport/tariff/params',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function submitAgreement(forms) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_AGREEMENT,
        actionTypes.SUBMIT_AGREEMENT_SUCCEED,
        actionTypes.SUBMIT_AGREEMENT_FAIL,
      ],
      endpoint: 'v1/transport/tariff',
      method: 'post',
      data: forms,
      origin: 'mongo',
    },
  };
}

export function updateAgreement(forms) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_AGREEMENT,
        actionTypes.UPDATE_AGREEMENT_SUCCEED,
        actionTypes.UPDATE_AGREEMENT_FAIL,
      ],
      endpoint: 'v1/transport/tariff/agreement',
      method: 'post',
      data: forms,
      origin: 'mongo',
    },
  };
}

export function submitRateSource(tariffId, code, region, name) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_RATESRC,
        actionTypes.SUBMIT_RATESRC_SUCCEED,
        actionTypes.SUBMIT_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratesource',
      method: 'post',
      data: {
        tariffId, code, region, name,
      },
      origin: 'mongo',
    },
  };
}

export function loadRatesSources(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RATESRC,
        actionTypes.LOAD_RATESRC_SUCCEED,
        actionTypes.LOAD_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratesources',
      method: 'get',
      params,
      origin: 'mongo',
    },
  };
}

export function updateRateSource(rateId, code, region, name) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RATESRC,
        actionTypes.UPDATE_RATESRC_SUCCEED,
        actionTypes.UPDATE_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/update/ratesource',
      method: 'post',
      data: {
        rateId, code, region, name,
      },
      origin: 'mongo',
    },
  };
}

export function delRateSource(rateId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_RATESRC,
        actionTypes.DEL_RATESRC_SUCCEED,
        actionTypes.DEL_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/del/ratesource',
      method: 'post',
      data: { rateId },
      origin: 'mongo',
    },
  };
}

export function loadRateEnds({
  rateId, pageSize, current, searchValue,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RATENDS,
        actionTypes.LOAD_RATENDS_SUCCEED,
        actionTypes.LOAD_RATENDS_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratends',
      method: 'get',
      params: {
        rateId, pageSize, current, searchValue,
      },
      origin: 'mongo',
    },
  };
}

export function submitRateEnd(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_RATEND,
        actionTypes.SUBMIT_RATEND_SUCCEED,
        actionTypes.SUBMIT_RATEND_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratend',
      method: 'post',
      data,
      origin: 'mongo',
    },
  };
}

export function updateRateEnd(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RATEND,
        actionTypes.UPDATE_RATEND_SUCCEED,
        actionTypes.UPDATE_RATEND_FAIL,
      ],
      endpoint: 'v1/transport/tariff/update/ratend',
      method: 'post',
      data,
      origin: 'mongo',
    },
  };
}

export function delRateEnd(rateId, id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_RATEND,
        actionTypes.DEL_RATEND_SUCCEED,
        actionTypes.DEL_RATEND_FAIL,
      ],
      endpoint: 'v1/transport/tariff/del/ratend',
      method: 'post',
      data: { rateId, id },
      origin: 'mongo',
    },
  };
}

export function addFee(tariffId, transModeCode, fee) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_FEE,
        actionTypes.CREATE_FEE_SUCCEED,
        actionTypes.CREATE_FEE_FAIL,
      ],
      endpoint: 'v1/transport/tariff/fee/add',
      method: 'post',
      data: { tariffId, transModeCode, fee },
      origin: 'mongo',
    },
  };
}

export function deleteFee(tariffId, feeId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_FEE,
        actionTypes.DELETE_FEE_SUCCEED,
        actionTypes.DELETE_FEE_FAIL,
      ],
      endpoint: 'v1/transport/tariff/fee/delete',
      method: 'post',
      data: { tariffId, feeId },
      origin: 'mongo',
    },
  };
}

export function updateFee(tariffId, feeId, fee) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_FEE,
        actionTypes.UPDATE_FEE_SUCCEED,
        actionTypes.UPDATE_FEE_FAIL,
      ],
      endpoint: 'v1/transport/tariff/fee/update',
      method: 'post',
      data: { tariffId, feeId, fee },
      origin: 'mongo',
    },
  };
}

export function updateTariffValid(tariffId, valid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_TARIFF_VALID,
        actionTypes.UPDATE_TARIFF_VALID_SUCCEED,
        actionTypes.UPDATE_TARIFF_VALID_FAIL,
      ],
      endpoint: 'v1/transport/tariff/valid',
      method: 'post',
      data: { tariffId, valid },
      origin: 'mongo',
    },
  };
}

export function publishTariff(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PUBLISH_TARIFF,
        actionTypes.PUBLISH_TARIFF_SUCCEED,
        actionTypes.PUBLISH_TARIFF_FAIL,
      ],
      endpoint: 'v1/transport/tariff/publish',
      method: 'post',
      data,
      origin: 'mongo',
    },
  };
}

export function showCreateTariffModal(visible) {
  return {
    type: actionTypes.SHOW_CREATE_TARIFF_MODAL,
    data: { visible },
  };
}

export function showPublishTariffModal(visible) {
  return {
    type: actionTypes.SHOW_PUBLISH_TARIFF_MODAL,
    data: { visible },
  };
}

export function changeTariff(data) {
  return {
    type: actionTypes.CHANGE_TARIFF,
    data,
  };
}

export function createTariffByNextVersion({ quoteNo, version, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_TARIFF_BY_NEXT_VERSION,
        actionTypes.CREATE_TARIFF_BY_NEXT_VERSION_SUCCEED,
        actionTypes.CREATE_TARIFF_BY_NEXT_VERSION_FAIL,
      ],
      endpoint: 'v1/transport/tariff/nextVersion',
      method: 'post',
      data: { quoteNo, version, tenantId },
      origin: 'mongo',
    },
  };
}

export function restoreTariff({
  draftId, archivedId, loginName, publishCommit,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RESTORE_TARIFF,
        actionTypes.RESTORE_TARIFF_SUCCEED,
        actionTypes.RESTORE_TARIFF_FAIL,
      ],
      endpoint: 'v1/transport/tariff/restore',
      method: 'post',
      data: {
        draftId, archivedId, loginName, publishCommit,
      },
      origin: 'mongo',
    },
  };
}
