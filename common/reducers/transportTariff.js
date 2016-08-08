import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tariff/', [
  'LOAD_TARIFFS', 'LOAD_TARIFFS_SUCCEED', 'LOAD_TARIFFS_FAIL',
  'LOAD_TARIFF', 'LOAD_TARIFF_SUCCEED', 'LOAD_TARIFF_FAIL',
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
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'name', value: '' },
  ],
  tarifflist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  tariffId: '',
  agreement: {
    intervals: [],
  },
  ratesRefAgreement: {},
  ratesSourceLoading: false,
  ratesSourceList: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  rateId: '',
  ratesEndLoading: false,
  ratesEndList: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  partners: [],
  formParams: {
    transModes: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TARIFFS:
      return { ...state, loading: true };
    case actionTypes.LOAD_TARIFFS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TARIFFS_SUCCEED:
      return { ...state, loading: false,
        loaded: true, tarifflist: action.result.data,
        filters: JSON.parse(action.params.filters),
      };
    case actionTypes.LOAD_NEW_FORM:
      return { ...state, agreement: initialState.agreement,
        ratesRefAgreement: initialState.agreement,
        tariffId: initialState.tariffId,
        ratesSourceList: initialState.ratesSourceList,
        rateId: initialState.rateId,
        ratesEndList: initialState.ratesEndList,
        partners: [],
      };
    case actionTypes.LOAD_TARIFF_SUCCEED: {
      const res = action.result.data.tariff.agreement;
      const agreement = {
        id: res._id,
        kind: res.kind,
        name: res.name,
        partnerId: res.partner && res.partner.id,
        effectiveDate: new Date(res.effectiveDate),
        expiryDate: new Date(res.expiryDate),
        transModeCode: res.transModeCode,
        goodsType: res.goodsType,
        meter: res.meter,
        intervals: res.intervals,
        vehicleTypes: res.vehicleTypes,
      };
      const partners = res.partner ? [{ partner_code: res.partner.name,
        partner_id: res.partner.id, name: res.partner.name }] : [];
      return { ...state, agreement, partners,
        ratesRefAgreement: agreement,
        tariffId: action.result.data.tariff._id,
        ratesSourceList: { ...state.ratesSourceList,
          ...action.result.data.ratesSourceList },
        rateId: action.result.data.ratesSourceList.data.length > 0
          && action.result.data.ratesSourceList.data[0]._id,
        ratesEndList: { ...state.ratesEndList,
          ...action.result.data.ratesEndList },
      };
    }
    case actionTypes.LOAD_PARTNERS_SUCCEED:
     return { ...state, partners: action.result.data };
    case actionTypes.LOAD_FORMPARAMS_SUCCEED:
      return { ...state, formParams: action.result.data };
    case actionTypes.SUBMIT_AGREEMENT_SUCCEED:
      return { ...state, tariffId: action.result.data,
        ratesRefAgreement: action.data };
    case actionTypes.LOAD_RATESRC:
      return { ...state, ratesSourceLoading: true };
    case actionTypes.LOAD_RATESRC_SUCCEED:
      return { ...state, ratesSourceLoading: false, ratesSourceList: action.result.data,
        rateId: '', ratesEndList: initialState.ratesEndList };
    case actionTypes.LOAD_RATESRC_FAIL:
      return { ...state, ratesSourceLoading: false };
    case actionTypes.DEL_RATESRC_SUCCEED:
      return { ...state, rateId: '', ratesEndList: initialState.ratesEndList };
    case actionTypes.LOAD_RATENDS:
      return { ...state, ratesEndLoading: true };
    case actionTypes.LOAD_RATENDS_SUCCEED:
      return { ...state, ratesEndLoading: false, rateId: action.params.rateId,
        ratesEndList: action.result.data };
    case actionTypes.LOAD_RATENDS_FAIL:
      return { ...state, ratesEndLoading: false };
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

export function loadTariff(tariffId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TARIFF,
        actionTypes.LOAD_TARIFF_SUCCEED,
        actionTypes.LOAD_TARIFF_FAIL,
      ],
      endpoint: 'v1/transport/tariff',
      method: 'get',
      params: { tariffId },
      origin: 'mongo',
    },
  };
}

export function loadPartners(tenantId, typeCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, typeCode },
    },
  };
}

export function loadNewForm() {
  return {
    type: actionTypes.LOAD_NEW_FORM,
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

export function submitRateSource(tariffId, code, region) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_RATESRC,
        actionTypes.SUBMIT_RATESRC_SUCCEED,
        actionTypes.SUBMIT_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratesource',
      method: 'post',
      data: { tariffId, code, region },
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

export function updateRateSource(rateId, code, region) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RATESRC,
        actionTypes.UPDATE_RATESRC_SUCCEED,
        actionTypes.UPDATE_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/update/ratesource',
      method: 'post',
      data: { rateId, code, region },
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

export function loadRateEnds({ rateId, pageSize, current }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RATENDS,
        actionTypes.LOAD_RATENDS_SUCCEED,
        actionTypes.LOAD_RATENDS_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratends',
      method: 'get',
      params: { rateId, pageSize, current },
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
