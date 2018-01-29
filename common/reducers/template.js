import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/hub/collab/template', [
  'TOGGLE_TEMPLATE_MODAL',
  'CREATE_TEMPLATE', 'CREATE_TEMPLATE_SUCCEED', 'CREATE_TEMPLATE_FAIL',
  'LOAD_TEMPLATES', 'LOAD_TEMPLATES_SUCCEED', 'LOAD_TEMPLATES_FAIL',
  'UPDATE_TEMPLATE', 'UPDATE_TEMPLATE_SUCCEED', 'UPDATE_TEMPLATE_FAIL',
  'DELETE_TEMPLATE', 'DELETE_TEMPLATE_SUCCEED', 'DELETE_TEMPLATE_FAIL',
]);

const initialState = {
  templateModal: {
    visible: false,
    record: {},
  },
  templates: {
    data: [],
    pageSize: 10,
    current: 1,
  },
  filter: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_TEMPLATE_MODAL:
      return {
        ...state,
        templateModal: {
          ...state.templateModal,
          visible: action.visible,
          record: action.record,
        },
      };
    case actionTypes.LOAD_TEMPLATES_SUCCEED:
      return { ...state, templates: { ...action.result.data } };
    default:
      return state;
  }
}

export function toggleTemplateModal(visible, record = {}) {
  return {
    type: actionTypes.TOGGLE_TEMPLATE_MODAL,
    visible,
    record,
  };
}

export function createTemplate({
  name, sender, title, content,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_TEMPLATE,
        actionTypes.CREATE_TEMPLATE_SUCCEED,
        actionTypes.CREATE_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/hub/template/create',
      method: 'post',
      data: {
        name, sender, title, content,
      },
    },
  };
}

export function updateTemplate({
  name, sender, title, content, id,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_TEMPLATE,
        actionTypes.UPDATE_TEMPLATE_SUCCEED,
        actionTypes.UPDATE_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/hub/template/update',
      method: 'post',
      data: {
        name, sender, title, content, id,
      },
    },
  };
}

export function loadTemplates({ pageSize, current, filter }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TEMPLATES,
        actionTypes.LOAD_TEMPLATES_SUCCEED,
        actionTypes.LOAD_TEMPLATES_FAIL,
      ],
      endpoint: 'v1/hub/templates/load',
      method: 'get',
      params: { pageSize, current, filter },
    },
  };
}

export function deleteTemplate(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TEMPLATE,
        actionTypes.DELETE_TEMPLATE_SUCCEED,
        actionTypes.DELETE_TEMPLATE_FAIL,
      ],
      endpoint: 'v1/hub/template/delete',
      method: 'post',
      data: { id },
    },
  };
}
