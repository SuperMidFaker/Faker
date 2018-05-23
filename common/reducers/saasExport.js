import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/export/', [
  'HANDLE_EXPORT', 'HANDLE_EXPORT_SUCCEED', 'HANDLE_EXPORT_FAIL',
  'TOGGLE_EXPORT_PANEL',
]);

const initialState = {
  visible: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_EXPORT_PANEL:
      return { ...state, visible: action.visible };
    default:
      return state;
  }
}


export function handleExport({
  type, thead, tbody, formData
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.HANDLE_EXPORT,
        actionTypes.HANDLE_EXPORT_SUCCEED,
        actionTypes.HANDLE_EXPORT_FAIL,
      ],
      endpoint: 'v1/saas/bizexport',
      method: 'post',
      data: {
        type,
        thead,
        tbody,
        formData,
      },
    },
  };
}

export function toggleExportPanel (visible) {
  return {
    type: actionTypes.TOGGLE_EXPORT_PANEL,
    visible,
  };
}
