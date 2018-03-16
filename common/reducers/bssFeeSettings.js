import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/fee/settings/', [
  'VISIBLE_NEW_GROUP_MODAL',
  'LOAD_FEE_GROUPS', 'LOAD_FEE_GROUPS_SUCCEED', 'LOAD_FEE_GROUPS_FAIL',
  'ADD_FEE_GROUP', 'ADD_FEE_GROUP_SUCCEED', 'ADD_FEE_GROUP_FAIL',
  'DELETE_FEE_GROUP', 'DELETE_FEE_GROUP_SUCCEED', 'DELETE_FEE_GROUP_FAIL',
  'ALTER_FEE_GROUP_NAME', 'ALTER_FEE_GROUP_NAME_SUCCEED', 'ALTER_FEE_GROUP_NAME_FAIL',
  'VISIBLE_NEW_ELEMENT_MODAL',
  'LOAD_FEE_ELEMENTS', 'LOAD_FEE_ELEMENTS_SUCCEED', 'LOAD_FEE_ELEMENTS_FAIL',
  'LOAD_ALL_FEE_GROUPS', 'LOAD_ALL_FEE_GROUPS_SUCCEED', 'LOAD_ALL_FEE_GROUPS_FAIL',
  'LOAD_PARENT_FEE_ELEMENTS', 'LOAD_PARENT_FEE_ELEMENTS_SUCCEED', 'LOAD_PARENT_FEE_ELEMENTS_FAIL',
  'ADD_FEE_ELEMENT', 'ADD_FEE_ELEMENT_SUCCEED', 'ADD_FEE_ELEMENT_FAIL',
  'ALTER_FEE_ELEMENT', 'ALTER_FEE_ELEMENT_SUCCEED', 'ALTER_FEE_ELEMENT_FAIL',
  'DELETE_FEE_ELEMENT', 'DELETE_FEE_ELEMENT_SUCCEED', 'DELETE_FEE_ELEMENT_FAIL',
  'VISIBLE_NEW_Rate_MODAL',
  'CHANGE_FEE_ELEMENT_GROUP', 'CHANGE_FEE_ELEMENT_GROUP_SUCCEED', 'CHANGE_FEE_ELEMENT_GROUP_FAIL',
]);

const initialState = {
  visibleNewFeeGModal: false,
  feeGroupslist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  gplistFilter: {
    code: '',
  },
  feeElementlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  ellistFilter: {
    code: '',
  },
  gpLoading: false,
  elLoading: false,
  visibleNewElementModal: {
    visible: false,
  },
  allFeeGroups: [],
  parentFeeElements: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.VISIBLE_NEW_GROUP_MODAL:
      return { ...state, visibleNewFeeGModal: action.data };
    case actionTypes.LOAD_FEE_GROUPS:
      return {
        ...state,
        gplistFilter: JSON.parse(action.params.filter),
        gpLoading: true,
      };
    case actionTypes.LOAD_FEE_GROUPS_SUCCEED:
      return { ...state, gpLoading: false, feeGroupslist: action.result.data };
    case actionTypes.LOAD_FEE_ELEMENTS:
      return {
        ...state,
        ellistFilter: JSON.parse(action.params.filter),
        elLoading: true,
      };
    case actionTypes.LOAD_FEE_ELEMENTS_SUCCEED:
      return { ...state, elLoading: false, feeElementlist: action.result.data };
    case actionTypes.LOAD_ALL_FEE_GROUPS_SUCCEED:
      return { ...state, allFeeGroups: action.result.data };
    case actionTypes.ALTER_FEE_GROUP_NAME_SUCCEED:
      return {
        ...state,
        feeGroupslist: {
          ...state.feeGroupslist,
          data: state.feeGroupslist.data.map((fg) => {
            if (fg.id === action.data.id) {
              return { ...fg, fee_group_name: action.data.groupName };
            }
            return fg;
          }),
        },
      };
    case actionTypes.LOAD_PARENT_FEE_ELEMENTS_SUCCEED:
      return { ...state, parentFeeElements: action.result.data };
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

export function toggleNewFeeElementModal(visible, parentFeeCode, parentFeeType, parentFeeGroup) {
  return {
    type: actionTypes.VISIBLE_NEW_ELEMENT_MODAL,
    data: {
      visible, parentFeeCode, parentFeeType, parentFeeGroup,
    },
  };
}

export function loadAllFeeGroups() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ALL_FEE_GROUPS,
        actionTypes.LOAD_ALL_FEE_GROUPS_SUCCEED,
        actionTypes.LOAD_ALL_FEE_GROUPS_FAIL,
      ],
      endpoint: 'v1/bss/all/fee/groups/load',
      method: 'get',
    },
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

export function loadParentFeeElements() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARENT_FEE_ELEMENTS,
        actionTypes.LOAD_PARENT_FEE_ELEMENTS_SUCCEED,
        actionTypes.LOAD_PARENT_FEE_ELEMENTS_FAIL,
      ],
      endpoint: 'v1/bss/parent/fee/elements/load',
      method: 'get',
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

export function changeFeeElementGroup(feeCode, feeGroup) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHANGE_FEE_ELEMENT_GROUP,
        actionTypes.CHANGE_FEE_ELEMENT_GROUP_SUCCEED,
        actionTypes.CHANGE_FEE_ELEMENT_GROUP_FAIL,
      ],
      endpoint: 'v1/bss/fee/element/group/change',
      method: 'post',
      data: { feeCode, feeGroup },
    },
  };
}

