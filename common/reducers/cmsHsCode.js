import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/hscode/', [
  'LOAD_HSCODES', 'LOAD_HSCODES_SUCCEED', 'LOAD_HSCODES_FAIL',
  'LOAD_HSCODE_CATEGORIES', 'LOAD_HSCODE_CATEGORIES_SUCCEED', 'LOAD_HSCODE_CATEGORIES_FAIL',
  'ADD_HSCODE_CATEGORY', 'ADD_HSCODE_CATEGORY_SUCCEED', 'ADD_HSCODE_CATEGORY_FAIL',
  'REMOVE_HSCODE_CATEGORY', 'REMOVE_HSCODE_CATEGORY_SUCCEED', 'REMOVE_HSCODE_CATEGORY_FAIL',
  'UPDATE_HSCODE_CATEGORY', 'UPDATE_HSCODE_CATEGORY_SUCCEED', 'UPDATE_HSCODE_CATEGORY_FAIL',
  'LOAD_CATEGORY_HSCODE', 'LOAD_CATEGORY_HSCODE_SUCCEED', 'LOAD_CATEGORY_HSCODE_FAIL',
  'ADD_CATEGORY_HSCODE', 'ADD_CATEGORY_HSCODE_SUCCEED', 'ADD_CATEGORY_HSCODE_FAIL',
  'REMOVE_CATEGORY_HSCODE', 'REMOVE_CATEGORY_HSCODE_SUCCEED', 'REMOVE_CATEGORY_HSCODE_FAIL',
  'GET_ELEMENT_BY_HSCODE', 'GET_ELEMENT_BY_HSCODE_SUCCEED', 'GET_ELEMENT_BY_HSCODE_FAIL',
]);

const initialState = {
  hscodes: {
    data: [],
    pageSize: 20,
    current: 1,
    totalCount: 0,
    searchText: '',
  },
  hscodeCategories: [],
  categoryHscodes: {
    data: [],
    categoryId: -1,
    pageSize: 20,
    current: 1,
    totalCount: 0,
    searchText: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_HSCODES_SUCCEED:
      return { ...state, hscodes: { ...state.hscodes, ...action.result.data } };
    case actionTypes.LOAD_HSCODE_CATEGORIES_SUCCEED:
      return { ...state, hscodeCategories: action.result.data.categories };
    case actionTypes.ADD_HSCODE_CATEGORY_SUCCEED: {
      const hscodeCategories = [...state.hscodeCategories];
      hscodeCategories.push(action.result.data);
      return { ...state, hscodeCategories };
    }
    case actionTypes.REMOVE_HSCODE_CATEGORY_SUCCEED:
      return { ...state, hscodeCategories: state.hscodeCategories.filter(item => item.id !== action.data.id) };
    case actionTypes.UPDATE_HSCODE_CATEGORY_SUCCEED: {
      const hscodeCategories = state.hscodeCategories.map((item) => {
        if (item.id === action.data.id) {
          return { ...item, ...action.data };
        } else {
          return item;
        }
      });
      return { ...state, hscodeCategories };
    }
    case actionTypes.LOAD_CATEGORY_HSCODE_SUCCEED:
      return { ...state, categoryHscodes: action.result.data };
    default:
      return state;
  }
}

export function loadHscodes(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_HSCODES,
        actionTypes.LOAD_HSCODES_SUCCEED,
        actionTypes.LOAD_HSCODES_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/hscodes',
      method: 'get',
      params,
    },
  };
}

export function loadHsCodeCategories(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_HSCODE_CATEGORIES,
        actionTypes.LOAD_HSCODE_CATEGORIES_SUCCEED,
        actionTypes.LOAD_HSCODE_CATEGORIES_FAIL,
      ],
      endpoint: 'v1/cms/cmsTradeitem/hscode/categories',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addHsCodeCategory(tenantId, name, type) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_HSCODE_CATEGORY,
        actionTypes.ADD_HSCODE_CATEGORY_SUCCEED,
        actionTypes.ADD_HSCODE_CATEGORY_FAIL,
      ],
      endpoint: 'v1/cms/cmsTradeitem/hscode/category/add',
      method: 'post',
      data: { tenantId, name, type },
    },
  };
}

export function removeHsCodeCategory(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_HSCODE_CATEGORY,
        actionTypes.REMOVE_HSCODE_CATEGORY_SUCCEED,
        actionTypes.REMOVE_HSCODE_CATEGORY_FAIL,
      ],
      endpoint: 'v1/cms/cmsTradeitem/hscode/category/remove',
      method: 'post',
      data: { id },
    },
  };
}

export function updateHsCodeCategory(id, name) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_HSCODE_CATEGORY,
        actionTypes.UPDATE_HSCODE_CATEGORY_SUCCEED,
        actionTypes.UPDATE_HSCODE_CATEGORY_FAIL,
      ],
      endpoint: 'v1/cms/cmsTradeitem/hscode/category/update',
      method: 'post',
      data: { id, name },
    },
  };
}

export function loadCategoryHsCode({ categoryId, current, pageSize, searchText }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CATEGORY_HSCODE,
        actionTypes.LOAD_CATEGORY_HSCODE_SUCCEED,
        actionTypes.LOAD_CATEGORY_HSCODE_FAIL,
      ],
      endpoint: 'v1/cms/cmsTradeitem/hscode/categoryHsCode',
      method: 'get',
      params: { categoryId, current, pageSize, searchText },
    },
  };
}

export function addCategoryHsCode(categoryId, tenantId, hscode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_CATEGORY_HSCODE,
        actionTypes.ADD_CATEGORY_HSCODE_SUCCEED,
        actionTypes.ADD_CATEGORY_HSCODE_FAIL,
      ],
      endpoint: 'v1/cms/cmsTradeitem/hscode/categoryHscode/add',
      method: 'post',
      data: { categoryId, tenantId, hscode },
    },
  };
}

export function removeCategoryHsCode(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_CATEGORY_HSCODE,
        actionTypes.REMOVE_CATEGORY_HSCODE_SUCCEED,
        actionTypes.REMOVE_CATEGORY_HSCODE_FAIL,
      ],
      endpoint: 'v1/cms/cmsTradeitem/hscode/categoryHscode/remove',
      method: 'post',
      data: { id },
    },
  };
}

export function getElementByHscode(hscode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_ELEMENT_BY_HSCODE,
        actionTypes.GET_ELEMENT_BY_HSCODE_SUCCEED,
        actionTypes.GET_ELEMENT_BY_HSCODE_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/get/element/by/hscode',
      method: 'get',
      params: { hscode },
    },
  };
}
