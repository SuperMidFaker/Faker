import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/export/', [
  'EXPORT_SAAS_BIZ_FILE', 'EXPORT_SAAS_BIZ_FILE_SUCCEED', 'EXPORT_SAAS_BIZ_FILE_FAIL',
  'TOGGLE_EXPORT_PANEL', 'TOGGLE_EXPORT_LOADING',
]);

const initialState = {
  visible: false,
  exporting: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_EXPORT_PANEL:
      return { ...state, visible: action.visible };
    case actionTypes.TOGGLE_EXPORT_LOADING:
      return { ...state, exporting: action.exporting };
    case actionTypes.EXPORT_SAAS_BIZ_FILE_SUCCEED:
    case actionTypes.EXPORT_SAAS_BIZ_FILE_FAIL:
      return { ...state, exporting: false };
    default:
      return state;
  }
}


export function exportSaasBizFile({
  type, thead, tbody, formData,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXPORT_SAAS_BIZ_FILE,
        actionTypes.EXPORT_SAAS_BIZ_FILE_SUCCEED,
        actionTypes.EXPORT_SAAS_BIZ_FILE_FAIL,
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

export function toggleExportPanel(visible) {
  return {
    type: actionTypes.TOGGLE_EXPORT_PANEL,
    visible,
  };
}

export function toggleExportLoading(exporting) {
  return {
    type: actionTypes.TOGGLE_EXPORT_LOADING,
    exporting,
  };
}
