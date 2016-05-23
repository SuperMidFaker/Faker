import { CLIENT_API } from '../../redux-middlewares/api';
export function appendFormAcitonTypes(domain, actypes) {
  ['FORM_LOAD', 'FORM_LOAD_SUCCEED', 'FORM_LOAD_FAIL',
  'FORM_ASSIGN', 'FORM_CLEAR', 'SET_FORM_VALUE'].forEach(
    act => actypes[act] = `${domain}${act}`);
}

export function formReducer(actionTypes, state, action, defaultForm, stateFormName) {
  switch (action.type) {
  case actionTypes.FORM_ASSIGN: {
    if (action.index !== -1) {
      return {
        ...state, selectedIndex: action.index,
        formData: state[stateFormName].data[action.index]
      };
    } else {
      return { ...state, selectedIndex: action.index };
    }
  }
  case actionTypes.FORM_CLEAR:
    return { ...state, selectedIndex: -1, formData: defaultForm };
  case actionTypes.FORM_LOAD_SUCCEED:
    return { ...state, formData: action.result.data };
  case actionTypes.SET_FORM_VALUE: {
    const form = { ...state.formData };
    form[action.data.field] = action.data.value;
    return { ...state, formData: form };
  }
  default:
    return;
  }
}

export function isFormDataLoadedC(wantedKey, state, stateListName) {
  // todo rethink this strategy
  let loaded = state.formData.key === wantedKey;
  state[stateListName].data.forEach((c) => {
    if (c.key === wantedKey) {
      loaded = true;
      return;
    }
  });
  return loaded;
}

export function loadFormC(cookie, endpoint, params, actionTypes) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.FORM_LOAD, actionTypes.FORM_LOAD_SUCCEED, actionTypes.FORM_LOAD_FAIL],
      endpoint,
      method: 'get',
      params,
      cookie
    }
  };
}

export function assignFormC(wantedKey, state, stateListName, actionTypes) {
  let index = -1;
  state[stateListName].data.forEach((c, idx)=> {
    if (c.key === wantedKey) {
      index = idx;
      return;
    }
  });
  return {
    type: actionTypes.FORM_ASSIGN,
    index
  };
}

export function clearFormC(actionTypes) {
  return {
    type: actionTypes.FORM_CLEAR
  };
}

export function setFormValueC(actionTypes, field, newValue) {
  return {
    type: actionTypes.SET_FORM_VALUE,
    data: { field, value: newValue }
  };
}
