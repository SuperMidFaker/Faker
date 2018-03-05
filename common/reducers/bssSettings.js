import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/settings/', [
  'VISIBLE_NEW_GROUP_MODAL',
  'LOAD_FEE_GROUPS', 'LOAD_FEE_GROUPS_SUCCEED', 'LOAD_FEE_GROUPS_FAIL',
  'ADD_FEE_GROUP', 'ADD_FEE_GROUP_SUCCEED', 'ADD_FEE_GROUP_FAIL',
  'DELETE_FEE_GROUP', 'DELETE_FEE_GROUP_SUCCEED', 'DELETE_FEE_GROUP_FAIL',
  'ALTER_FEE_GROUP_NAME', 'ALTER_FEE_GROUP_NAME_SUCCEED', 'ALTER_FEE_GROUP_NAME_FAIL',
  'VISIBLE_NEW_ELEMENT_MODAL',
  'LOAD_FEE_ELEMENTS', 'LOAD_FEE_ELEMENTS_SUCCEED', 'LOAD_FEE_ELEMENTS_FAIL',
  'ADD_FEE_ELEMENT', 'ADD_FEE_ELEMENT_SUCCEED', 'ADD_FEE_ELEMENT_FAIL',
  'ALTER_FEE_ELEMENT', 'ALTER_FEE_ELEMENT_SUCCEED', 'ALTER_FEE_ELEMENT_FAIL',
  'DELETE_FEE_ELEMENT', 'DELETE_FEE_ELEMENT_SUCCEED', 'DELETE_FEE_ELEMENT_FAIL',
]);

const initialState = {
  visibleNewFeeGModal: false,
  feeElements: [],
  feeElementMap: {},
  feeGroups: [],
  visibleNewElementModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.VISIBLE_NEW_GROUP_MODAL:
      return { ...state, visibleNewFeeGModal: action.data };
    case actionTypes.LOAD_FEE_GROUPS_SUCCEED:
      return { ...state, feeGroups: action.result.data };
    case actionTypes.LOAD_FEE_ELEMENTS_SUCCEED:
      return { ...state, feeElements: action.result.data.parentItems, feeElementMap: action.result.data.childMaps };
    case actionTypes.VISIBLE_NEW_ELEMENT_MODAL:
      return { ...state, visibleNewElementModal: action.data };
    default:
      return state;
  }
}

export function toggleNewFeeGroupModal(visible) {
  return {
    type: actionTypes.VISIBLE_NEW_GROUP_MODAL,
    data: visible,
  };
}

export function loadFeeGroups(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEE_GROUPS,
        actionTypes.LOAD_FEE_GROUPS_SUCCEED,
        actionTypes.LOAD_FEE_GROUPS_FAIL,
      ],
      endpoint: 'v1/bss/fee/groups/load',
      method: 'get',
      params,
    },
  };
}

export function addFeeGroup(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_FEE_GROUP,
        actionTypes.ADD_FEE_GROUP_SUCCEED,
        actionTypes.ADD_FEE_GROUP_FAIL,
      ],
      endpoint: 'v1/bss/fee/group/add',
      method: 'post',
      data,
    },
  };
}

export function deleteFeeGroup(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_FEE_GROUP,
        actionTypes.DELETE_FEE_GROUP_SUCCEED,
        actionTypes.DELETE_FEE_GROUP_FAIL,
      ],
      endpoint: 'v1/bss/fee/group/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function alterFeeGroupName(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ALTER_FEE_GROUP_NAME,
        actionTypes.ALTER_FEE_GROUP_NAME_SUCCEED,
        actionTypes.ALTER_FEE_GROUP_NAME_FAIL,
      ],
      endpoint: 'v1/bss/fee/group/name/alter',
      method: 'post',
      data,
    },
  };
}

export function toggleNewFeeElementModal(visible, parentFeeCode) {
  return {
    type: actionTypes.VISIBLE_NEW_ELEMENT_MODAL,
    data: { visible, parentFeeCode },
  };
}

export function loadFeeElements(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEE_ELEMENTS,
        actionTypes.LOAD_FEE_ELEMENTS_SUCCEED,
        actionTypes.LOAD_FEE_ELEMENTS_FAIL,
      ],
      endpoint: 'v1/bss/fee/elements/load',
      method: 'get',
      params,
    },
  };
}

export function addFeeElement(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_FEE_ELEMENT,
        actionTypes.ADD_FEE_ELEMENT_SUCCEED,
        actionTypes.ADD_FEE_ELEMENT_FAIL,
      ],
      endpoint: 'v1/bss/fee/element/add',
      method: 'post',
      data,
    },
  };
}

export function alterFeeElement(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ALTER_FEE_ELEMENT,
        actionTypes.ALTER_FEE_ELEMENT_SUCCEED,
        actionTypes.ALTER_FEE_ELEMENT_FAIL,
      ],
      endpoint: 'v1/bss/fee/element/alter',
      method: 'post',
      data,
    },
  };
}

export function deleteFeeElement(code) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_FEE_ELEMENT,
        actionTypes.DELETE_FEE_ELEMENT_SUCCEED,
        actionTypes.DELETE_FEE_ELEMENT_FAIL,
      ],
      endpoint: 'v1/bss/fee/element/delete',
      method: 'post',
      data: { code },
    },
  };
}
