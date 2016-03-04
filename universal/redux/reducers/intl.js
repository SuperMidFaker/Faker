import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
const initialState = {
  loaded: false,
  locale: '',
  langCLDR: '',
  messages: {
  }
};
const actionTypes = createActionTypes('@@welogix/intl/', [
  'TRANSLATION_LOAD', 'TRANSLATION_LOAD_SUCCEED', 'TRANSLATION_LOAD_FAIL'
]);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TRANSLATION_LOAD_SUCCEED:
      return { ...state, ...action.result.data, loaded: true };
    default:
      return state;
  }
}

export function loadTranslation(cookie, locale) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.TRANSLATION_LOAD, actionTypes.TRANSLATION_LOAD_SUCCEED,
        actionTypes.TRANSLATION_LOAD_FAIL],
      endpoint: 'v1/intl/messages',
      method: 'get',
      cookie,
      params: { locale }
    }
  };
}
