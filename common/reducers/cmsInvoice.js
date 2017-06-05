import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/invoice/', [
  'TOGGLE_INV_TEMPLATE',
  'CREATE_INV_TEMPLATE', 'CREATE_INV_TEMPLATE_SUCCEED', 'CREATE_INV_TEMPLATE_FAIL',
]);

const initialState = {
  invTemplateModal: {
    visible: false,
    templateName: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_INV_TEMPLATE:
      return { ...state, invTemplateModal: { ...state.invTemplateModal, ...action.data } };
    default:
      return state;
  }
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
