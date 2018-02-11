import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/invoice/', [
  'TOGGLE_INV_TEMPLATE',
  'CREATE_INV_TEMPLATE', 'CREATE_INV_TEMPLATE_SUCCEED', 'CREATE_INV_TEMPLATE_FAIL',
  'LOAD_INV_TEMPLATES', 'LOAD_INV_TEMPLATES_SUCCEED', 'LOAD_INV_TEMPLATES_FAIL',
  'DELETE_INV_TEMPLATE', 'DELETE_INV_TEMPLATE_SUCCEED', 'DELETE_INV_TEMPLATE_FAIL',
  'LOAD_INV_DATA', 'LOAD_INV_DATA_SUCCEED', 'LOAD_INV_DATA_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'SAVE_TEMP_CHANGE', 'SAVE_TEMP_CHANGE_SUCCEED', 'SAVE_TEMP_CHANGE_FAIL',
  'LOAD_DOCU_DATAS', 'LOAD_DOCU_DATAS_SUCCEED', 'LOAD_DOCU_DATAS_FAIL',
  'LOAD_DOCU_BODY', 'LOAD_DOCU_BODY_SUCCEED', 'LOAD_DOCU_BODY_FAIL',
  'SAVE_DOCU_CHANGE', 'SAVE_DOCU_CHANGE_SUCCEED', 'SAVE_DOCU_CHANGE_FAIL',
  'UPDATE_DOCU_TEMPLATE', 'UPDATE_DOCU_TEMPLATE_SUCCEED', 'UPDATE_DOCU_TEMPLATE_FAIL',
  'SET_DOCU',
  'LOAD_TEMPLATE_FILE', 'LOAD_TEMPLATE_FILE_SUCCEED', 'LOAD_TEMPLATE_FILE_FAIL',
  'SAVE_TEMPLATE_FILE', 'SAVE_TEMPLATE_FILE_SUCCEED', 'SAVE_TEMPLATE_FILE_FAIL',
  'DELETE_TEMPLATE_FILE', 'DELETE_TEMPLATE_FILE_SUCCEED', 'DELETE_TEMPLATE_FILE_FAIL',
  'UPLOAD_IMG', 'UPLOAD_IMG_SUCCEED', 'UPLOAD_IMG_FAIL',
  'REMOVE_IMG', 'REMOVE_IMG_SUCCEED', 'REMOVE_IMG_FAIL',
  'LOAD_INV_IMGS', 'LOAD_INV_IMGS_SUCCEED', 'LOAD_INV_IMGS_FAIL',
]);

const initialState = {
  invTemplateModal: {
    visible: false,
    templateName: '',
  },
  invTemplates: [],
  template: {},
  invData: {},
  params: {
    trxModes: [],
    customs: [],
  },
  docuType: 0,
  docuDatas: [],
  docuBody: [],
  tempFile: { doc_name: '', url: '' },
  logo: '',
  seal: '',
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_INV_TEMPLATE:
      return { ...state, invTemplateModal: { ...state.invTemplateModal, ...action.data } };
    case actionTypes.LOAD_INV_TEMPLATES_SUCCEED:
      return { ...state, invTemplates: action.result.data, docuType: action.params.docuType };
    case actionTypes.LOAD_INV_DATA_SUCCEED:
      return { ...state, template: action.result.data.template, invData: action.result.data.invData };
    case actionTypes.LOAD_PARAMS_SUCCEED:
      return { ...state, params: { ...state.params, ...action.result.data } };
    case actionTypes.SAVE_TEMP_CHANGE_SUCCEED:
      return { ...state, invData: { ...state.invData, ...action.payload.change } };
    case actionTypes.LOAD_INV_IMGS_SUCCEED:
      return { ...state, logo: action.result.data.logo, seal: action.result.data.seal }
    case actionTypes.LOAD_DOCU_DATAS_SUCCEED:
      return { ...state, docuDatas: action.result.data };
    case actionTypes.LOAD_DOCU_BODY_SUCCEED:
      return { ...state, docuBody: action.result.data };
    case actionTypes.SET_DOCU:
      return { ...state, docu: action.data };
    case actionTypes.UPDATE_DOCU_TEMPLATE_SUCCEED:
      return { ...state, docu: { ...state.docu, ...action.result.data } };
    case actionTypes.LOAD_TEMPLATE_FILE_SUCCEED:
      return { ...state, tempFile: { ...initialState.tempFile, ...action.result.data } };
    case actionTypes.DELETE_TEMPLATE_FILE_SUCCEED:
      return { ...state, tempFile: initialState.tempFile };
    default:
      return state;
  }
}

export function loadInvImgs(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INV_IMGS,
        actionTypes.LOAD_INV_IMGS_SUCCEED,
        actionTypes.LOAD_INV_IMGS_FAIL,
      ],
      endpoint: 'v1/cms/invoice/imgs/load',
      method: 'get',
      params,
    },
  };
}

export function loadInvTemplates(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INV_TEMPLATES,
        actionTypes.LOAD_INV_TEMPLATES_SUCCEED,
        actionTypes.LOAD_INV_TEMPLATES_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/load',
      method: 'get',
      params,
    },
  };
}

export function loadInvTemplateData(templateId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INV_DATA,
        actionTypes.LOAD_INV_DATA_SUCCEED,
        actionTypes.LOAD_INV_DATA_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/datas/load',
      method: 'get',
      params: { templateId },
    },
  };
}

export function loadTempParams(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAMS,
        actionTypes.LOAD_PARAMS_SUCCEED,
        actionTypes.LOAD_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/params',
      method: 'get',
      params,
    },
  };
}

export function toggleInvTempModal(visible, templateName) {
  return {
    type: actionTypes.TOGGLE_INV_TEMPLATE,
    data: { visible, templateName },
  };
}

export function createInvTemplate(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_INV_TEMPLATE,
        actionTypes.CREATE_INV_TEMPLATE_SUCCEED,
        actionTypes.CREATE_INV_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/create',
      method: 'post',
      data: datas,
    },
  };
}

export function deleteInvTemplate(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_INV_TEMPLATE,
        actionTypes.DELETE_INV_TEMPLATE_SUCCEED,
        actionTypes.DELETE_INV_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function saveTempChange(change, id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_TEMP_CHANGE,
        actionTypes.SAVE_TEMP_CHANGE_SUCCEED,
        actionTypes.SAVE_TEMP_CHANGE_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/change/save',
      method: 'post',
      data: { change, id },
      payload: { change },
    },
  };
}

export function uploadImages(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPLOAD_IMG,
        actionTypes.UPLOAD_IMG_SUCCEED,
        actionTypes.UPLOAD_IMG_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/img/upload',
      method: 'post',
      data,
    },
  };
}

export function removeImg(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_IMG,
        actionTypes.REMOVE_IMG_SUCCEED,
        actionTypes.REMOVE_IMG_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/img/remove',
      method: 'post',
      data,
    },
  };
}

export function loadDocuDatas(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DOCU_DATAS,
        actionTypes.LOAD_DOCU_DATAS_SUCCEED,
        actionTypes.LOAD_DOCU_DATAS_FAIL,
      ],
      endpoint: 'v1/cms/mainfest/docu/datas/load',
      method: 'get',
      params,
    },
  };
}

export function loadDocuBody(headId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DOCU_BODY,
        actionTypes.LOAD_DOCU_BODY_SUCCEED,
        actionTypes.LOAD_DOCU_BODY_FAIL,
      ],
      endpoint: 'v1/cms/mainfest/docu/body/load',
      method: 'get',
      params: { headId },
    },
  };
}

export function setDocu(docu) {
  return {
    type: actionTypes.SET_DOCU,
    data: docu,
  };
}

export function saveDocuChange(change, id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_DOCU_CHANGE,
        actionTypes.SAVE_DOCU_CHANGE_SUCCEED,
        actionTypes.SAVE_DOCU_CHANGE_FAIL,
      ],
      endpoint: 'v1/cms/mainfest/docu/change/save',
      method: 'post',
      data: { change, id },
      payload: { change },
    },
  };
}

export function updateDocuTemplate(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_DOCU_TEMPLATE,
        actionTypes.UPDATE_DOCU_TEMPLATE_SUCCEED,
        actionTypes.UPDATE_DOCU_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/cms/mainfest/document/template/update',
      method: 'post',
      data,
    },
  };
}

export function saveDoctsTempFile(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_TEMPLATE_FILE,
        actionTypes.SAVE_TEMPLATE_FILE_SUCCEED,
        actionTypes.SAVE_TEMPLATE_FILE_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/file/save',
      method: 'post',
      data,
    },
  };
}

export function loadTempFile(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TEMPLATE_FILE,
        actionTypes.LOAD_TEMPLATE_FILE_SUCCEED,
        actionTypes.LOAD_TEMPLATE_FILE_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/file/load',
      method: 'get',
      params,
    },
  };
}

export function deleteTempFile(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TEMPLATE_FILE,
        actionTypes.DELETE_TEMPLATE_FILE_SUCCEED,
        actionTypes.DELETE_TEMPLATE_FILE_FAIL,
      ],
      endpoint: 'v1/cms/invoice/template/file/delete',
      method: 'post',
      data,
    },
  };
}
