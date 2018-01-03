import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/ciq/declaration/', [
  'LOAD_CIQ_DECLS', 'LOAD_CIQ_DECLS_SUCCEED', 'LOAD_CIQ_DECLS_FAIL',
  'LOAD_CIQ_DECL_HEAD', 'LOAD_CIQ_DECL_HEAD_SUCCEED', 'LOAD_CIQ_DECL_HEAD_FAIL',
  'LOAD_CIQ_DECL_GOODS', 'LOAD_CIQ_DECL_GOODS_SUCCEED', 'LOAD_CIQ_DECL_GOODS_FAIL',
  'LOAD_CIQ_PARAMS', 'LOAD_CIQ_PARAMS_SUCCEED', 'LOAD_CIQ_PARAMS_FAIL',
  'SHOW_GOODS_MODAL', 'HIDE_GOODS_MODAL',
  'SEARCH_ORGANIZATIONS', 'SEARCH_ORGANIZATIONS_SUCCEED', 'SEARCH_ORGANIZATIONS_FAIL',
  'SEARCH_WORLDPORTS', 'SEARCH_WORLDPORTS_SUCCEED', 'SEARCH_WORLDPORTS_FAIL',
  'SEARCH_CHINAPORTS', 'SEARCH_CHINAPORTS_SUCCEED', 'SEARCH_CHINAPORTS_FAIL',
  'SEARCH_COUNTRIES', 'SEARCH_COUNTRIES_SUCCEED', 'SEARCH_COUNTRIES_FAIL',
  'UPDATE_CIQ_HEAD', 'UPDATE_CIQ_HEAD_SUCCEED', 'UPDATE_CIQ_HEAD_FAIL',
  'SET_FIXED_COUNTRY', 'SET_FIXED_ORGANIZATIONS', 'SET_FIXED_WORLDPORTS',
  'UPDATE_CIQ_HEAD_FIELD', 'UPDATE_CIQ_HEAD_FIELD_SUCCEED', 'UPDATE_CIQ_HEAD_FIELD_FAIL',
  'CIQ_HEAD_CHANGE', 'TOGGLE_ATT_DOCU_MODAL', 'TOGGLE_DECL_MSG_MODAL',
  'UPDATE_CIQ_GOOD', 'UPDATE_CIQ_GOOD_SUCCEED', 'UPDATE_CIQ_GOOD_FAIL',
  'EXTEND_COUNTRY_CODE', 'EXTEND_COUNTRY_CODE_SUCCEED', 'EXTEND_COUNTRY_CODE_FAIL',
  'SEARCH_CUSTOMS', 'SEARCH_CUSTOMS_SUCCEED', 'SEARCH_CUSTOMS_FAIL',
  'TOGGLE_ENTQUALIFI_MODAL', 'TOGGLE_INSP_QUARANTINE_DOCUMENTS_REQUIRED_MODAL',
  'SAVE_ENT_QUALIF', 'SAVE_ENT_QUALIF_SUCCEED', 'SAVE_ENT_QUALIF_FAIL',
  'LOAD_ENT_QUALIF', 'LOAD_ENT_QUALIF_SUCCEED', 'LOAD_ENT_QUALIF_FAIL',
  'DELETE_ENT_QUALIF', 'DELETE_ENT_QUALIF_SUCCEED', 'DELETE_ENT_QUALIF_FAIL',
  'SAVE_REQUIRED_DOCUMENTS', 'SAVE_REQUIRED_DOCUMENTS_SUCCEED', 'SAVE_REQUIRED_DOCUMENTS_FAIL',
  'SAVE_ATT_DOCUMENTS', 'SAVE_ATT_DOCUMENTS_SUCCEED', 'SAVE_ATT_DOCUMENTS_FAIL',
  'LOAD_ATT_DOCUMENTS', 'LOAD_ATT_DOCUMENTS_SUCCEED', 'LOAD_ATT_DOCUMENTS_FAIL',
  'TOGGLE_GOODS_LICENCE_MODAL', 'TOGGLE_GOODS_CONT_MODAL',
  'ADD_GOODS_LICENCE', 'ADD_GOODS_LICENCE_SUCCEED', 'ADD_GOODS_LICENCE_FAIL',
  'GOODS_LICENCES_LOAD', 'GOODS_LICENCES_LOAD_SUCCEED', 'GOODS_LICENCES_LOAD_FAIL',
  'DELETE_GOODS_LICENCES', 'DELETE_GOODS_LICENCES_SUCCEED', 'DELETE_GOODS_LICENCES_FAIL',
  'UPDATE_STANDBY_INFO', 'UPDATE_STANDBY_INFO_SUCCEED', 'UPDATE_STANDBY_INFO_FAIL',
  'LOAD_STANDBY_INFO', 'LOAD_STANDBY_INFO_SUCCEED', 'LOAD_STANDBY_INFO_FAIL',
  'UPDATE_GOODS_LICENCE_INFO', 'UPDATE_GOODS_LICENCE_INFO_SUCCEED', 'UPDATE_GOODS_LICENCE_INFO_FAIL',
  'LOAD_GOODS_LICENCE_INFO', 'LOAD_GOODS_LICENCE_INFO_SUCCEED', 'LOAD_GOODS_LICENCE_INFO_FAIL',
  'ADD_GOODS_CONT', 'ADD_GOODS_CONT_SUCCEED', 'ADD_GOODS_CONT_FAIL',
  'GOODS_CONT_LOAD', 'GOODS_CONT_LOAD_SUCCEED', 'GOODS_CONT_LOAD_FAIL',
  'DELETE_GOODS_CONT', 'DELETE_GOODS_CONT_SUCCEED', 'DELETE_GOODS_CONT_FAIL',
  'GET_CIQCODE_BY_HSCODE', 'GET_CIQCODE_BY_HSCODE_SUCCEED', 'GET_CIQCODE_BY_HSCODE_FAIL',
  'GET_LICENCE_NOS', 'GET_LICENCE_NOS_SUCCEED', 'GET_LICENCE_NOS_FAIL',
]);

const initialState = {
  ciqDeclList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  ciqListFilter: {
    ieType: 'all',
    status: 'all',
    clientPid: -1,
    startTime: '',
    endTime: '',
  },
  ciqParams: {
    organizations: [],
    countries: [],
    worldPorts: [],
    chinaPorts: [],
    currencies: [],
    units: [],
    customs: [],
    fixedCountries: [],
    fixedOrganizations: [],
    fixedWorldPorts: [],
  },
  goodsModal: {
    visible: false,
    data: {},
  },
  ciqDeclHead: {
    head: [],
    entries: [],
    ciqs: [],
  },
  ciqDeclGoods: [],
  ciqHeadChangeTimes: 0,
  entQualifictaionModal: {
    visible: false,
  },
  entQualifs: [],
  requiredDocuModal: {
    visible: false,
  },
  attDocuModal: {
    visible: false,
  },
  declMsgModal: {
    visible: false,
    fileName: '',
    fileType: '',
  },
  goodsLicenceModal: {
    visible: false,
    goodsData: {},
  },
  goodsContModal: {
    visible: false,
    goodsData: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CIQ_DECLS:
      return { ...state, ciqDeclList: { ...state.ciqDeclList, loading: true } };
    case actionTypes.LOAD_CIQ_DECLS_SUCCEED:
      return {
        ...state,
        ciqDeclList: { ...state.ciqDeclList, loading: false, ...action.result.data },
        ciqListFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_CIQ_DECLS_FAIL:
      return { ...state, ciqDeclList: { ...state.ciqDeclList, loading: false } };
    case actionTypes.LOAD_CIQ_PARAMS_SUCCEED:
      return {
        ...state,
        ciqParams: {
          ...state.ciqParams,
          units: [...action.result.data.units],
          currencies: [...action.result.data.currencies],
          chinaPorts: [...action.result.data.chinaPorts],
          customs: [...action.result.data.customs],
          organizations: [
            ...action.result.data.organizations,
            ...state.ciqParams.fixedOrganizations,
          ],
          countries: [...action.result.data.countries, ...state.ciqParams.countries],
          worldPorts: [...action.result.data.worldPorts, ...state.ciqParams.worldPorts],
        },
      };
    case actionTypes.SHOW_GOODS_MODAL:
      return { ...state, goodsModal: { ...state.goodsModal, visible: true, data: action.record } };
    case actionTypes.HIDE_GOODS_MODAL:
      return { ...state, goodsModal: { ...state.goodsModal, visible: false, data: {} } };
    case actionTypes.LOAD_CIQ_DECL_HEAD_SUCCEED:
      return {
        ...state,
        ciqDeclHead: {
          head: action.result.data.head,
          entries: action.result.data.entries,
          ciqs: action.result.data.ciqs,
        },
        ciqParams: {
          ...state.ciqParams,
          organizations: [...state.ciqParams.organizations, ...action.result.data.organizations],
          countries: [...state.ciqParams.countries, ...action.result.data.countries],
          worldPorts: [...state.ciqParams.worldPorts, ...action.result.data.worldports],
          customs: [...state.ciqParams.customs, ...action.result.data.customs],
          fixedOrganizations: [...action.result.data.organizations],
          fixedCountries: [...action.result.data.countries],
          fixedWorldPorts: [...action.result.data.worldports],
        },
      };
    case actionTypes.LOAD_CIQ_DECL_GOODS_SUCCEED:
      return { ...state, ciqDeclGoods: action.result.data };
    case actionTypes.SEARCH_ORGANIZATIONS_SUCCEED:
      return {
        ...state,
        ciqParams: {
          ...state.ciqParams,
          organizations: [...action.result.data, ...state.ciqParams.fixedOrganizations],
        },
      };
    case actionTypes.SEARCH_WORLDPORTS_SUCCEED:
      return {
        ...state,
        ciqParams: {
          ...state.ciqParams,
          worldPorts: [...action.result.data, ...state.ciqParams.fixedWorldPorts],
        },
      };
    case actionTypes.SEARCH_CHINAPORTS_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, chinaPorts: [...action.result.data] } };
    case actionTypes.SEARCH_COUNTRIES_SUCCEED:
      return {
        ...state,
        ciqParams: {
          ...state.ciqParams,
          countries: [...action.result.data, ...state.ciqParams.fixedCountries],
        },
      };
    case actionTypes.SEARCH_CUSTOMS_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, customs: [...action.result.data] } };
    case actionTypes.SET_FIXED_COUNTRY:
      return { ...state, ciqParams: { ...state.ciqParams, fixedCountries: [...action.records] } };
    case actionTypes.SET_FIXED_ORGANIZATIONS:
      return {
        ...state,
        ciqParams: {
          ...state.ciqParams,
          fixedOrganizations: [...action.records],
        },
      };
    case actionTypes.SET_FIXED_WORLDPORTS:
      return { ...state, ciqParams: { ...state.ciqParams, fixedWorldPorts: [...action.records] } };
    case actionTypes.CIQ_HEAD_CHANGE:
      return { ...state, ciqHeadChangeTimes: state.ciqHeadChangeTimes + 1 };
    case actionTypes.UPDATE_CIQ_HEAD_SUCCEED:
      return { ...state, ciqHeadChangeTimes: 0 };
    case actionTypes.EXTEND_COUNTRY_CODE_SUCCEED:
      return {
        ...state,
        ciqParams: {
          ...state.ciqParams,
          countries: [...state.ciqParams.countries, action.result.data],
        },
      };
    case actionTypes.TOGGLE_ENTQUALIFI_MODAL:
      return {
        ...state,
        entQualifictaionModal: { ...state.entQualifictaionModal, visible: action.visible },
      };
    case actionTypes.LOAD_ENT_QUALIF_SUCCEED:
      return { ...state, entQualifs: action.result.data };
    case actionTypes.TOGGLE_INSP_QUARANTINE_DOCUMENTS_REQUIRED_MODAL:
      return {
        ...state,
        requiredDocuModal: {
          ...state.entQualifictaionModal,
          visible: action.visible,
        },
      };
    case actionTypes.TOGGLE_ATT_DOCU_MODAL:
      return { ...state, attDocuModal: { ...state.attDocuModal, visible: action.visible } };
    case actionTypes.TOGGLE_DECL_MSG_MODAL:
      return {
        ...state,
        declMsgModal: {
          ...state.declMsgModal,
          visible: action.visible,
          fileName: action.fileName,
          fileType: action.fileType,
        },
      };
    case actionTypes.TOGGLE_GOODS_LICENCE_MODAL:
      return {
        ...state,
        goodsLicenceModal: {
          ...state.goodsLicenceModal,
          visible: action.visible,
          goodsData: action.goodsData,
        },
      };
    case actionTypes.TOGGLE_GOODS_CONT_MODAL:
      return {
        ...state,
        goodsContModal: {
          ...state.goodsContModal,
          visible: action.visible,
          goodsData: action.goodsData,
        },
      };
    default:
      return state;
  }
}

export function loadCiqDecls(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_DECLS,
        actionTypes.LOAD_CIQ_DECLS_SUCCEED,
        actionTypes.LOAD_CIQ_DECLS_FAIL,
      ],
      endpoint: 'v1/cms/declare/get/ciqDecls',
      method: 'get',
      params,
    },
  };
}

export function loadCiqDeclHead(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_DECL_HEAD,
        actionTypes.LOAD_CIQ_DECL_HEAD_SUCCEED,
        actionTypes.LOAD_CIQ_DECL_HEAD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/decl/head/load',
      method: 'get',
      params: { preEntrySeqNo },
    },
  };
}

export function loadCiqDeclGoods(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_DECL_GOODS,
        actionTypes.LOAD_CIQ_DECL_GOODS_SUCCEED,
        actionTypes.LOAD_CIQ_DECL_GOODS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/decl/goods/load',
      method: 'get',
      params: { preEntrySeqNo },
    },
  };
}

export function loadCiqParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_PARAMS,
        actionTypes.LOAD_CIQ_PARAMS_SUCCEED,
        actionTypes.LOAD_CIQ_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/params/load',
      method: 'get',
    },
  };
}

export function showGoodsModal(record) {
  return {
    type: actionTypes.SHOW_GOODS_MODAL,
    record,
  };
}

export function hideGoodsModal() {
  return {
    type: actionTypes.HIDE_GOODS_MODAL,
  };
}

export function searchOrganizations(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_ORGANIZATIONS,
        actionTypes.SEARCH_ORGANIZATIONS_SUCCEED,
        actionTypes.SEARCH_ORGANIZATIONS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/organizations/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchWorldPorts(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_WORLDPORTS,
        actionTypes.SEARCH_WORLDPORTS_SUCCEED,
        actionTypes.SEARCH_WORLDPORTS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/worldports/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchChinaPorts(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_CHINAPORTS,
        actionTypes.SEARCH_CHINAPORTS_SUCCEED,
        actionTypes.SEARCH_CHINAPORTS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/chinaports/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchCountries(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_COUNTRIES,
        actionTypes.SEARCH_COUNTRIES_SUCCEED,
        actionTypes.SEARCH_COUNTRIES_FAIL,
      ],
      endpoint: 'v1/cms/ciq/countries/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchCustoms(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_CUSTOMS,
        actionTypes.SEARCH_CUSTOMS_SUCCEED,
        actionTypes.SEARCH_CUSTOMS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/customs/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function updateCiqHead(preEntrySeqNo, data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CIQ_HEAD,
        actionTypes.UPDATE_CIQ_HEAD_SUCCEED,
        actionTypes.UPDATE_CIQ_HEAD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/head/update',
      method: 'post',
      data: { preEntrySeqNo, data },
    },
  };
}

export function setFixedCountry(records) {
  return {
    type: actionTypes.SET_FIXED_COUNTRY,
    records,
  };
}

export function setFixedOrganizations(records) {
  return {
    type: actionTypes.SET_FIXED_ORGANIZATIONS,
    records,
  };
}

export function setFixedWorldPorts(records) {
  return {
    type: actionTypes.SET_FIXED_WORLDPORTS,
    records,
  };
}

export function updateCiqHeadField(field, value, preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CIQ_HEAD_FIELD,
        actionTypes.UPDATE_CIQ_HEAD_FIELD_SUCCEED,
        actionTypes.UPDATE_CIQ_HEAD_FIELD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/head/field/update',
      method: 'post',
      data: { field, value, preEntrySeqNo },
    },
  };
}

export function ciqHeadChange() {
  return {
    type: actionTypes.CIQ_HEAD_CHANGE,
  };
}

export function updateCiqGood(id, data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CIQ_GOOD,
        actionTypes.UPDATE_CIQ_GOOD_SUCCEED,
        actionTypes.UPDATE_CIQ_GOOD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/good/update',
      method: 'post',
      data: { id, data },
    },
  };
}

export function extendCountryParam(code) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXTEND_COUNTRY_CODE,
        actionTypes.EXTEND_COUNTRY_CODE_SUCCEED,
        actionTypes.EXTEND_COUNTRY_CODE_FAIL,
      ],
      endpoint: 'v1/cms/extend/country/param',
      method: 'get',
      params: { code },
    },
  };
}

export function toggleEntQualifiModal(visible) {
  return {
    type: actionTypes.TOGGLE_ENTQUALIFI_MODAL,
    visible,
  };
}

export function saveEntQualif(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_ENT_QUALIF,
        actionTypes.SAVE_ENT_QUALIF_SUCCEED,
        actionTypes.SAVE_ENT_QUALIF_FAIL,
      ],
      endpoint: 'v1/cms/ciq/ent/qualif/save',
      method: 'post',
      data,
    },
  };
}

export function loadEntQualif(customerPartnerId, ciqCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ENT_QUALIF,
        actionTypes.LOAD_ENT_QUALIF_SUCCEED,
        actionTypes.LOAD_ENT_QUALIF_FAIL,
      ],
      endpoint: 'v1/cms/ent/qualif/load',
      method: 'get',
      params: { customerPartnerId, ciqCode },
    },
  };
}

export function deleteEntQualif(ids) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_ENT_QUALIF,
        actionTypes.DELETE_ENT_QUALIF_SUCCEED,
        actionTypes.DELETE_ENT_QUALIF_FAIL,
      ],
      endpoint: 'v1/cms/ent/qualif/delete',
      method: 'post',
      data: { ids },
    },
  };
}

export function toggleReqDocuModal(visible) {
  return {
    type: actionTypes.TOGGLE_INSP_QUARANTINE_DOCUMENTS_REQUIRED_MODAL,
    visible,
  };
}

export function saveRequiredDocuments(data, preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_REQUIRED_DOCUMENTS,
        actionTypes.SAVE_REQUIRED_DOCUMENTS_SUCCEED,
        actionTypes.SAVE_REQUIRED_DOCUMENTS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/required/documents/save',
      method: 'post',
      data: { data: JSON.stringify(data), preEntrySeqNo },
    },
  };
}

export function toggleAttDocuModal(visible) {
  return {
    type: actionTypes.TOGGLE_ATT_DOCU_MODAL,
    visible,
  };
}

export function saveAttDocuments(documents, preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_ATT_DOCUMENTS,
        actionTypes.SAVE_ATT_DOCUMENTS_SUCCEED,
        actionTypes.SAVE_ATT_DOCUMENTS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/att/documents/save',
      method: 'post',
      data: { documents: JSON.stringify(documents), preEntrySeqNo },
    },
  };
}

export function loadAttDocuments(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ATT_DOCUMENTS,
        actionTypes.LOAD_ATT_DOCUMENTS_SUCCEED,
        actionTypes.LOAD_ATT_DOCUMENTS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/att/documents/load',
      method: 'get',
      params: { preEntrySeqNo },
    },
  };
}

export function toggleDeclMsgModal(visible, fileName = '', fileType = '') {
  return {
    type: actionTypes.TOGGLE_DECL_MSG_MODAL,
    visible,
    fileName,
    fileType,
  };
}

export function toggleGoodsLicenceModal(visible, goodsData = {}) {
  return {
    type: actionTypes.TOGGLE_GOODS_LICENCE_MODAL,
    visible,
    goodsData,
  };
}

export function addGoodsLicence(preEntrySeqNo, id, data, permitId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_GOODS_LICENCE,
        actionTypes.ADD_GOODS_LICENCE_SUCCEED,
        actionTypes.ADD_GOODS_LICENCE_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/licence/add',
      method: 'post',
      data: {
        preEntrySeqNo, id, data, permitId,
      },
    },
  };
}

export function deleteGoodsLicences(id, wrtofQty, wrtofLeft, permitId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_GOODS_LICENCES,
        actionTypes.DELETE_GOODS_LICENCES_SUCCEED,
        actionTypes.DELETE_GOODS_LICENCES_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/licences/delete',
      method: 'post',
      data: {
        id, wrtofQty, wrtofLeft, permitId,
      },
    },
  };
}

export function loadGoodsLicences(goodsId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GOODS_LICENCES_LOAD,
        actionTypes.GOODS_LICENCES_LOAD_SUCCEED,
        actionTypes.GOODS_LICENCES_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/licences/load',
      method: 'get',
      params: { goodsId },
    },
  };
}

export function updateStandbyInfo(info, goodsId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_STANDBY_INFO,
        actionTypes.UPDATE_STANDBY_INFO_SUCCEED,
        actionTypes.UPDATE_STANDBY_INFO_FAIL,
      ],
      endpoint: 'v1/cms/ciq/standby/info/update',
      method: 'post',
      data: { info: JSON.stringify(info), goodsId },
    },
  };
}

export function loadStandbyInfo(goodsId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STANDBY_INFO,
        actionTypes.LOAD_STANDBY_INFO_SUCCEED,
        actionTypes.LOAD_STANDBY_INFO_FAIL,
      ],
      endpoint: 'v1/cms/ciq/standby/info/load',
      method: 'get',
      params: { goodsId },
    },
  };
}

export function updateGoodsLicenceInfo(info, goodsId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_GOODS_LICENCE_INFO,
        actionTypes.UPDATE_GOODS_LICENCE_INFO_SUCCEED,
        actionTypes.UPDATE_GOODS_LICENCE_INFO_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/licence/info/update',
      method: 'post',
      data: { info: JSON.stringify(info), goodsId },
    },
  };
}

export function loadGoodsLicenceInfo(goodsId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_GOODS_LICENCE_INFO,
        actionTypes.LOAD_GOODS_LICENCE_INFO_SUCCEED,
        actionTypes.LOAD_GOODS_LICENCE_INFO_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/licence/info/load',
      method: 'get',
      params: { goodsId },
    },
  };
}

export function toggleGoodsContModal(visible, goodsData = {}) {
  return {
    type: actionTypes.TOGGLE_GOODS_CONT_MODAL,
    visible,
    goodsData,
  };
}

export function addGoodsCont(preEntrySeqNo, id, data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_GOODS_CONT,
        actionTypes.ADD_GOODS_CONT_SUCCEED,
        actionTypes.ADD_GOODS_CONT_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/cont/add',
      method: 'post',
      data: { preEntrySeqNo, id, data },
    },
  };
}

export function loadGoodsCont(goodsId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GOODS_CONT_LOAD,
        actionTypes.GOODS_CONT_LOAD_SUCCEED,
        actionTypes.GOODS_CONT_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/cont/load',
      method: 'get',
      params: { goodsId },
    },
  };
}

export function deleteGoodsCont(ids) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_GOODS_CONT,
        actionTypes.DELETE_GOODS_CONT_SUCCEED,
        actionTypes.DELETE_GOODS_CONT_FAIL,
      ],
      endpoint: 'v1/cms/ciq/goods/cont/delete',
      method: 'post',
      data: { ids },
    },
  };
}

export function getCiqCodeByHscode(hscode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_CIQCODE_BY_HSCODE,
        actionTypes.GET_CIQCODE_BY_HSCODE_SUCCEED,
        actionTypes.GET_CIQCODE_BY_HSCODE_FAIL,
      ],
      endpoint: 'v1/cms/ciqcode/get/by/hscode',
      method: 'get',
      params: { hscode },
    },
  };
}

export function loadLicenceNo(licType, ownerPartnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_LICENCE_NOS,
        actionTypes.GET_LICENCE_NOS_SUCCEED,
        actionTypes.GET_LICENCE_NOS_FAIL,
      ],
      endpoint: 'v1/cms/licence/nos/load',
      method: 'get',
      params: { licType, ownerPartnerId },
    },
  };
}
