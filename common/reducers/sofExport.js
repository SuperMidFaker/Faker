import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/export/', [
  'HANDLE_EXPORT', 'HANDLE_EXPORT_SUCCEED', 'HANDLE_EXPORT_FAIL',
]);

const initialState = {
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}


export function handleExport({
  type, thead, tbody, startDate, endDate, whseCode,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.HANDLE_EXPORT,
        actionTypes.HANDLE_EXPORT_SUCCEED,
        actionTypes.HANDLE_EXPORT_FAIL,
      ],
      endpoint: 'v1/sof/export/by/type',
      method: 'get',
      params: {
        type,
        thead: JSON.stringify(thead),
        tbody: JSON.stringify(tbody),
        startDate,
        endDate,
        whseCode,
      },
    },
  };
}
