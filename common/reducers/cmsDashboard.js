import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/dashboard/', [
  'CMS_STATISTICS', 'CMS_STATISTICS_SUCCEED', 'CMS_STATISTICS_FAIL',
]);

const initialState = {
  statistics: {
    startDate: null,
    endDate: null,
    cusPartnerId: '',
    cusTenantId: '',
    total: 0,
    sumImport: 0,
    sumExport: 0,
    processing: 0,
    declared: 0,
    released: 0,
    inspected: 0,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CMS_STATISTICS_SUCCEED:
      return { ...state, statistics: { ...state.statistics, ...action.result.data, ...action.params } };
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
