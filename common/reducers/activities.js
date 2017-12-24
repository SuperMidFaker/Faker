import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const initialState = {
  dockVisible: false,
  loading: false,
  recentActivities: [],
};
const actionTypes = createActionTypes('@@welogix/activities/', [
  'LOAD_RECENT_ACTIVITIES', 'LOAD_RECENT_ACTIVITIES_SUCCEED', 'LOAD_RECENT_ACTIVITIES_FAIL',
  'SHOW_ACTIVITIES_DOCK', 'HIDE_ACTIVITIES_DOCK',
]);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_RECENT_ACTIVITIES:
      return { ...state, loading: true };
    case actionTypes.LOAD_RECENT_ACTIVITIES_SUCCEED:
      return { ...state, loading: false };
    case actionTypes.LOAD_RECENT_ACTIVITIES_FAIL:
      return { ...state, loading: false };
    case actionTypes.SHOW_ACTIVITIES_DOCK: {
      return { ...state, dockVisible: true };
    }
    case actionTypes.HIDE_ACTIVITIES_DOCK: {
      return { ...state, dockVisible: false };
    }
    default:
      return state;
  }
}

export function loadRecentActivities(locale) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_RECENT_ACTIVITIES, actionTypes.LOAD_RECENT_ACTIVITIES_SUCCEED,
        actionTypes.LOAD_RECENT_ACTIVITIES_FAIL],
      endpoint: 'public/v1/intl/messages',
      method: 'get',
      params: { locale },
      origin: 'self',
    },
  };
}

export function showActivitiesDock() {
  return {
    type: actionTypes.SHOW_ACTIVITIES_DOCK,
  };
}

export function hideActivitiesDock() {
  return {
    type: actionTypes.HIDE_ACTIVITIES_DOCK,
  };
}
