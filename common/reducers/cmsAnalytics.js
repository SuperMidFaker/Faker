// import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/analytics/', [
  'TOGGLE_REPORT_SETTING_DOCK',

]);

const initialState = {
  reportSettingDock: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_REPORT_SETTING_DOCK:
      return {
        ...state,
        reportSettingDock: {
          ...state.reportSettingDock,
          visible: action.visible,
        },
      };
    default:
      return state;
  }
}

export function toggleReportSettingDock(visible) {
  return {
    type: actionTypes.TOGGLE_REPORT_SETTING_DOCK,
    visible,
  };
}

