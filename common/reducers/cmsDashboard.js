import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/dashboard/', [
  'CMS_STATISTICS', 'CMS_STATISTICS_SUCCEED', 'CMS_STATISTICS_FAIL',
  'CMS_ITEMS_STATS', 'CMS_ITEMS_STATS_SUCCEED', 'CMS_ITEMS_STATS_FAIL',
  'CMS_TAX_STATS', 'CMS_TAX_STATS_SUCCEED', 'CMS_TAX_STATS_FAIL',
  'CMS_IE_STATS', 'CMS_IE_STATS_SUCCEED', 'CMS_IE_STATS_FAIL',
]);

const initialState = {
  statistics: {
    startDate: null,
    endDate: null,
    clientView: { tenantIds: [], partnerIds: [] },
    total: 0,
    sumImport: 0,
    sumExport: 0,
    processing: 0,
    declared: 0,
    released: 0,
    inspected: 0,
    declcount: 0,
    totVals: { total_cny: 0, total_usd: 0 },
    totImVals: { total_cny: 0, total_usd: 0 },
    totExVals: { total_cny: 0, total_usd: 0 },
  },
  itemsStats: {
    repoCount: 0,
    unclassifiedItems: 0,
    pendingItems: 0,
    classifiedItems: 0,
  },
  taxStats: {
    startDate: null,
    endDate: null,
    clientView: { tenantIds: [], partnerIds: [] },
    totalPaid: 0,
    dutyTax: 0,
    vatTax: 0,
    comsuTax: 0,
    totalWithdrawn: 0,
  },
  importStats: {
    total_cny: 0,
    total_usd: 0,
    count: 0,
    cnyMockData: [],
    usdMockData: [],
  },
  exportStats: {
    total_cny: 0,
    total_usd: 0,
    count: 0,
    cnyMockData: [],
    usdMockData: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CMS_STATISTICS_SUCCEED:
      return { ...state, statistics: { ...state.statistics, ...action.result.data, ...action.params } };
    case actionTypes.CMS_ITEMS_STATS_SUCCEED:
      return { ...state, itemsStats: { ...state.itemsStats, ...action.result.data } };
    case actionTypes.CMS_TAX_STATS_SUCCEED:
      return { ...state, taxStats: { ...state.taxStats, ...action.result.data, ...action.params } };
    case actionTypes.CMS_IE_STATS_SUCCEED:
      return { ...state, importStats: { ...state.importStats, ...action.result.data.impVals }, exportStats: { ...state.exportStats, ...action.result.data.expVals } };
    default:
      return state;
  }
}

export function loadCmsStatistics(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CMS_STATISTICS,
        actionTypes.CMS_STATISTICS_SUCCEED,
        actionTypes.CMS_STATISTICS_FAIL,
      ],
      endpoint: 'v1/cms/dashboard/statistics',
      method: 'get',
      params,
    },
  };
}

export function loadCmsItemsStats(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CMS_ITEMS_STATS,
        actionTypes.CMS_ITEMS_STATS_SUCCEED,
        actionTypes.CMS_ITEMS_STATS_FAIL,
      ],
      endpoint: 'v1/cms/dashboard/classification/items/stats',
      method: 'get',
      params,
    },
  };
}

export function loadCmsTaxStats(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CMS_TAX_STATS,
        actionTypes.CMS_TAX_STATS_SUCCEED,
        actionTypes.CMS_TAX_STATS_FAIL,
      ],
      endpoint: 'v1/cms/dashboard/tax/stats',
      method: 'get',
      params,
    },
  };
}

export function loadIEStats(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CMS_IE_STATS,
        actionTypes.CMS_IE_STATS_SUCCEED,
        actionTypes.CMS_IE_STATS_FAIL,
      ],
      endpoint: 'v1/cms/dashboard/ie/stats',
      method: 'get',
      params,
    },
  };
}

