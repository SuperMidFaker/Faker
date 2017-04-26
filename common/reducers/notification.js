import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/notification/', [
  'LOADCORPMESSAGES', 'LOADCORPMESSAGES_SUCCEED', 'LOADCORPMESSAGES_FAIL',
  'MARK_MESSAGES', 'MARK_MESSAGES_SUCCEED', 'MARK_MESSAGES_FAIL',
  'MARK_MESSAGE', 'MARK_MESSAGE_SUCCEED', 'MARK_MESSAGE_FAIL',
  'RECORD_MESSAGES', 'RECORD_MESSAGES_SUCCEED', 'RECORD_MESSAGES_FAIL',
  'COUNT_MESSAGES', 'COUNT_MESSAGES_SUCCEED', 'COUNT_MESSAGES_FAIL',
  'ADD_MESSAGE_BADGE', 'SEND_MESSAGE_SUCCEED',
  'SHOW_NOTIFICATION_DOCK', 'HIDE_NOTIFICATION_DOCK',
]);

const initialState = {
  loaded: false,
  loading: false,
  submitting: false,
  selectedIndex: -1,
  dockVisible: false,
  messages: {
    loginId: 0,
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    status: 0,
    data: [],
  },
  unreadMessagesNum: 0,
  newMessage: {
    count: 0,
  },
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOADCORPMESSAGES_SUCCEED: {
      const messages = action.result.data;
      return { ...state, messages };
    }
    case actionTypes.MARK_MESSAGE_SUCCEED: {
      return state;
    }
    case actionTypes.MARK_MESSAGES_SUCCEED: {
      return { ...state, unreadMessagesNum: 0, messages: initialState.messages };
    }
    case actionTypes.COUNT_MESSAGES_SUCCEED: {
      return { ...state, ...action.result.data };
    }
    case actionTypes.ADD_MESSAGE_BADGE: {
      return { ...state, ...action.data };
    }
    case actionTypes.SEND_MESSAGE_SUCCEED: {
      return { ...state, newMessage: { count: state.newMessage.count + 1, ...action.data } };
    }
    case actionTypes.SHOW_NOTIFICATION_DOCK: {
      return { ...state, dockVisible: true };
    }
    case actionTypes.HIDE_NOTIFICATION_DOCK: {
      return { ...state, dockVisible: false };
    }
    default:
      return state;
  }
}


export function recordMessages({ loginId, tenantId, loginName, messages }) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.RECORD_MESSAGES, actionTypes.RECORD_MESSAGES_SUCCEED, actionTypes.RECORD_MESSAGES_FAIL],
      endpoint: 'v1/user/messages/record',
      method: 'post',
      data: { loginId, tenantId, loginName, messages },
    },
  };
}

export function loadMessages(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOADCORPMESSAGES, actionTypes.LOADCORPMESSAGES_SUCCEED, actionTypes.LOADCORPMESSAGES_FAIL],
      endpoint: 'v1/user/messages',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function markMessages(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.MARK_MESSAGES, actionTypes.MARK_MESSAGES_SUCCEED, actionTypes.MARK_MESSAGES_FAIL],
      endpoint: 'v1/user/messages/status',
      method: 'post',
      data: params,
    },
  };
}

export function markMessage(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.MARK_MESSAGE, actionTypes.MARK_MESSAGE_SUCCEED, actionTypes.MARK_MESSAGE_FAIL],
      endpoint: 'v1/user/message/status',
      method: 'post',
      data: params,
    },
  };
}

export function countMessages(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.COUNT_MESSAGES, actionTypes.COUNT_MESSAGES_SUCCEED, actionTypes.COUNT_MESSAGES_FAIL],
      endpoint: 'v1/user/messages/count',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function sendMessage(data) {
  return {
    type: actionTypes.SEND_MESSAGE_SUCCEED,
    data,
  };
}

export function messageBadgeNum(unreadMessagesNum) {
  return {
    type: actionTypes.ADD_MESSAGE_BADGE,
    data: { unreadMessagesNum },
  };
}

export function showNotificationDock() {
  return {
    type: actionTypes.SHOW_NOTIFICATION_DOCK,
  };
}

export function hideNotificationDock() {
  return {
    type: actionTypes.HIDE_NOTIFICATION_DOCK,
  };
}
