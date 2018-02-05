import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/dashboard/', [
  'LOAD_STATS', 'LOAD_STATS_SUCCEED', 'LOAD_STATS_FAIL',
]);

const initState = {
  statsCard: {
    inbounds: 0,
    asnPendings: 0,
    creates: 0,
    toPutAways: 0,
    inboundCompleted: 0,
    outbounds: 0,
    soPendings: 0,
    unallocated: 0,
    allocated: 0,
    picked: 0,
    outboundCompleted: 0,
    entryToSync: 0,
    normalToClear: 0,
    normalToExit: 0,
    portionToSync: 0,
    portionToClear: 0,
  },
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case actionTypes.LOAD_STATS_SUCCEED:
      return { ...state, statsCard: { ...action.result.data } };
    default:
      return state;
  }
}

export function loadStatsCard(startDate, endDate, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STATS,
        actionTypes.LOAD_STATS_SUCCEED,
        actionTypes.LOAD_STATS_FAIL,
      ],
      endpoint: 'v1/cwm/stats',
      method: 'get',
      params: { startDate, endDate, whseCode },
    },
  };
}
