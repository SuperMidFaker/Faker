import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/sof/dashboard/', [
  'LOAD_ORDER_STATS', 'LOAD_ORDER_STATS_SUCCEED', 'LOAD_ORDER_STATS_FAIL',
]);

const initialState = {
  orderStats: {
    totalOrders: 0,
    pending: 0,
    processing: 0,
    urgent: 0,
    completed: 0,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ORDER_STATS_SUCCEED:
      return { ...state, orderStats: { ...action.result.data } };
    default:
      return state;
  }
}

export function loadStatsCard(startDate, endDate) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDER_STATS,
        actionTypes.LOAD_ORDER_STATS_SUCCEED,
        actionTypes.LOAD_ORDER_STATS_FAIL,
      ],
      endpoint: 'v1/sof/order/stats',
      method: 'get',
      params: { startDate, endDate },
    },
  };
}
