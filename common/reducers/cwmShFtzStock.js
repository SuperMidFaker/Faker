import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/shftz/stock', [
  'COMPARE_FTZST', 'COMPARE_FTZST_SUCCEED', 'COMPARE_FTZST_FAIL',
  'MATCH_IMPFTZST', 'MATCH_IMPFTZST_SUCCEED', 'MATCH_IMPFTZST_FAIL',
  'LOAD_STOTASKS', 'LOAD_STOTASKS_SUCCEED', 'LOAD_STOTASKS_FAIL',
  'LOAD_STOCMPTASK', 'LOAD_STOCMPTASK_SUCCEED', 'LOAD_STOCMPTASK_FAIL',
  'LOAD_STOMAHTASK', 'LOAD_STOMAHTASK_SUCCEED', 'LOAD_STOMAHTASK_FAIL',
  'LOAD_STOMAHTASKML', 'LOAD_STOMAHTASKML_SUCCEED', 'LOAD_STOMAHTASKML_FAIL',
  'LOAD_STOMAHTASKNML', 'LOAD_STOMAHTASKNML_SUCCEED', 'LOAD_STOMAHTASKNML_FAIL',
  'LOAD_STOMAHTASKLSL', 'LOAD_STOMAHTASKLSL_SUCCEED', 'LOAD_STOMAHTASKLSL_FAIL',
  'LOAD_CUSSTOSS', 'LOAD_CUSSTOSS_SUCCEED', 'LOAD_CUSSTOSS_FAIL',
  'LOAD_NONBONDED_STOCKS', 'LOAD_NONBONDED_STOCKS_SUCCEED', 'LOAD_NONBONDED_STOCKS_FAIL',
  'DEL_STKT', 'DEL_STKT_SUCCEED', 'DEL_STKT_FAIL',
]);

const initialState = {
  loading: false,
  submitting: false,
  ftzTaskList: {
    loading: false,
    reload: false,
    data: [],
  },
  compareTask: {
    task: {},
    views: [],
    entrydiffs: [],
    inbounddiffs: [],
  },
  matchTask: {
    task: {},
    matchedlist: {
      totalCount: 0,
      current: 1,
      pageSize: 20,
      data: [],
    },
    nonmatchlist: {
      totalCount: 0,
      current: 1,
      pageSize: 20,
      data: [],
    },
    locationStock: {
      totalCount: 0,
      current: 1,
      pageSize: 20,
      data: [],
    },
  },
  cusStockSnapshot: [],
  stockDatas: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_STOCKS:
    case actionTypes.LOAD_NONBONDED_STOCKS:
    case actionTypes.LOAD_STOMAHTASKML:
    case actionTypes.LOAD_STOMAHTASKNML:
    case actionTypes.LOAD_STOMAHTASKLSL:
      return { ...state, loading: true };
    case actionTypes.LOAD_STOCKS_SUCCEED:
    case actionTypes.LOAD_NONBONDED_STOCKS_SUCCEED:
      return { ...state, stockDatas: action.result.data, loading: false };
    case actionTypes.LOAD_NONBONDED_STOCKS_FAIL:
    case actionTypes.LOAD_STOCKS_FAIL:
    case actionTypes.LOAD_STOMAHTASKML_FAIL:
    case actionTypes.LOAD_STOMAHTASKNML_FAIL:
    case actionTypes.LOAD_STOMAHTASKLSL_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOMAHTASKML_SUCCEED:
      return {
        ...state,
        matchTask: { ...state.matchTask, matchedlist: action.result.data },
        loading: false,
      };
    case actionTypes.LOAD_STOMAHTASKNML_SUCCEED:
      return {
        ...state,
        matchTask: { ...state.matchTask, nonmatchlist: action.result.data },
        loading: false,
      };
    case actionTypes.LOAD_STOMAHTASKLSL_SUCCEED:
      return {
        ...state,
        matchTask: { ...state.matchTask, locationStock: action.result.data },
        loading: false,
      };
    case actionTypes.LOAD_STOMAHTASK_SUCCEED:
      return { ...state, matchTask: { ...state.matchTask, task: action.result.data } };
    case actionTypes.COMPARE_FTZST:
    case actionTypes.MATCH_IMPFTZST:
      return { ...state, submitting: true };
    case actionTypes.COMPARE_FTZST_FAIL:
    case actionTypes.MATCH_IMPFTZST_FAIL:
      return { ...state, submitting: false };
    case actionTypes.COMPARE_FTZST_SUCCEED:
    case actionTypes.MATCH_IMPFTZST_SUCCEED:
      return { ...state, ftzTaskList: { ...state.ftzTaskList, reload: true }, submitting: false };
    case actionTypes.LOAD_STOTASKS:
      return { ...state, ftzTaskList: { ...state.ftzTaskList, loading: true, reload: false } };
    case actionTypes.LOAD_STOTASKS_SUCCEED:
      return {
        ...state,
        ftzTaskList: {
          ...state.ftzTaskList,
          loading: false,
          data: action.result.data,
        },
      };
    case actionTypes.LOAD_STOTASKS_FAIL:
      return { ...state, ftzTaskList: { ...state.ftzTaskList, loading: false } };
    case actionTypes.LOAD_STOCMPTASK_SUCCEED:
      return { ...state, compareTask: action.result.data };
    case actionTypes.LOAD_CUSSTOSS_SUCCEED:
      return { ...state, cusStockSnapshot: action.result.data };
    case actionTypes.DEL_STKT_SUCCEED:
      return { ...state, ftzTaskList: { ...state.ftzTaskList, reload: true } };
    default:
      return state;
  }
}

export function loadFtzStocks(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOCKS,
        actionTypes.LOAD_STOCKS_SUCCEED,
        actionTypes.LOAD_STOCKS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/details/get',
      method: 'get',
      params,
    },
  };
}

export function loadNonbondedStocks(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_NONBONDED_STOCKS,
        actionTypes.LOAD_NONBONDED_STOCKS_SUCCEED,
        actionTypes.LOAD_NONBONDED_STOCKS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/nonbonded/stock/load',
      method: 'get',
      params,
    },
  };
}

export function compareFtzStocks(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPARE_FTZST,
        actionTypes.COMPARE_FTZST_SUCCEED,
        actionTypes.COMPARE_FTZST_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/compare',
      method: 'post',
      data,
    },
  };
}

export function matchImportFtzStocks(field, files) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MATCH_IMPFTZST,
        actionTypes.MATCH_IMPFTZST_SUCCEED,
        actionTypes.MATCH_IMPFTZST_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/import/matchcompare',
      method: 'post',
      field,
      files,
    },
  };
}

export function loadStockTasks(whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOTASKS,
        actionTypes.LOAD_STOTASKS_SUCCEED,
        actionTypes.LOAD_STOTASKS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/tasks',
      method: 'get',
      params: { whseCode },
    },
  };
}

export function loadStockCompareTask(taskId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOCMPTASK,
        actionTypes.LOAD_STOCMPTASK_SUCCEED,
        actionTypes.LOAD_STOCMPTASK_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/compare/task',
      method: 'get',
      params: { taskId },
    },
  };
}

export function loadStockMatchTask(taskId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOMAHTASK,
        actionTypes.LOAD_STOMAHTASK_SUCCEED,
        actionTypes.LOAD_STOMAHTASK_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/matchtask',
      method: 'get',
      params: { taskId },
    },
  };
}

export function loadMatchTaskMatched(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOMAHTASKML,
        actionTypes.LOAD_STOMAHTASKML_SUCCEED,
        actionTypes.LOAD_STOMAHTASKML_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/matchtask/view',
      method: 'get',
      params: { ...params, status: 'matched' },
    },
  };
}

export function loadMatchTaskNonmatched(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOMAHTASKNML,
        actionTypes.LOAD_STOMAHTASKNML_SUCCEED,
        actionTypes.LOAD_STOMAHTASKNML_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/matchtask/view',
      method: 'get',
      params: { ...params, status: 'nonmatched' },
    },
  };
}

export function loadMatchTaskLocStock(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOMAHTASKLSL,
        actionTypes.LOAD_STOMAHTASKLSL_SUCCEED,
        actionTypes.LOAD_STOMAHTASKLSL_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/matchtask/view',
      method: 'get',
      params: { ...params, status: 'location' },
    },
  };
}

export function loadCusStockSnapshot(taskId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSSTOSS,
        actionTypes.LOAD_CUSSTOSS_SUCCEED,
        actionTypes.LOAD_CUSSTOSS_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/task/cus',
      method: 'get',
      params: { taskId },
    },
  };
}

export function delStockTask(taskId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_STKT,
        actionTypes.DEL_STKT_SUCCEED,
        actionTypes.DEL_STKT_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/stock/task/del',
      method: 'post',
      data: { taskId },
    },
  };
}
