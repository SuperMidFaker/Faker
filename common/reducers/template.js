import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/hub/collab/template', [
  'TOGGLE_TEMPLATE_MODAL',
  'CREATE_TEMPLATE', 'CREATE_TEMPLATE_SUCCEED', 'CREATE_TEMPLATE_FAIL',
]);

const initialState = {
  templateModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_TEMPLATE_MODAL:
      return { ...state, templateModal: { ...state.templateModal, visible: action.visible } };
    default:
      return state;
  }
}

export function toggleTemplateModal(visible) {
  return {
    type: actionTypes.TOGGLE_TEMPLATE_MODAL,
    visible,
  }
}

export function createTemplate({ name, sender, title }) {
  [CLIENT_API]: {
    types: [
      actionTypes.CREATE_TEMPLATE,
      actionTypes.CREATE_TEMPLATE_SUCCEED,
      actionTypes.CREATE_TEMPLATE_FAIL,
    ],
    endpoint: 'v1/hub/template/create',
    method: 'post',
    data: { name, sender, title },
  },
}