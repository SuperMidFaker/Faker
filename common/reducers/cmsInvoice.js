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
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_INV_TEMPLATE:
      return { ...state, invTemplateModal: { ...state.invTemplateModal, ...action.data } };
    case actionTypes.LOAD_INV_TEMPLATES_SUCCEED:
      return { ...state, invTemplates: action.result.data };
    case actionTypes.LOAD_INV_DATA_SUCCEED:
      return { ...state, template: action.result.data.template, invData: action.result.data.invData };
    case actionTypes.LOAD_PARAMS_SUCCEED:
      return { ...state, params: { ...state.params, ...action.result.data } };
    case actionTypes.SAVE_TEMP_CHANGE_SUCCEED:
      return { ...state, invData: { ...state.invData, ...action.payload.change } };
    default:
      return state;
  }
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
