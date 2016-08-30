import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  loaded: false,
  locale: '',
  messages: {
  },
};
const actionTypes = createActionTypes('@@welogix/intl/', [
  'TRANSLATION_LOAD', 'TRANSLATION_LOAD_SUCCEED', 'TRANSLATION_LOAD_FAIL',
  'CHANGE_LOCALE', 'CHANGE_LOCALE_SUCCEED', 'CHANGE_LOCALE_FAILED',
]);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TRANSLATION_LOAD_SUCCEED:
      return { ...state, locale: action.params.locale,
        messages: action.result.data, loaded: true };
    default:
      return state;
  }
}

export function loadTranslation(locale) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TRANSLATION_LOAD, actionTypes.TRANSLATION_LOAD_SUCCEED,
        actionTypes.TRANSLATION_LOAD_FAIL],
      endpoint: 'public/v1/intl/messages',
      method: 'get',
      params: { locale },
      origin: 'self',
    },
  };
}

export function changeUserLocale(loginId, locale) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHANGE_LOCALE,
        actionTypes.CHANGE_LOCALE_SUCCEED,
        actionTypes.CHANGE_LOCALE_FAILED,
      ],
      endpoint: 'v1/user/locale',
      method: 'post',
      data: { loginId, locale },
    },
  };
}
