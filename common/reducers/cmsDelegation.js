import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/resources/', [
  'CREATE_DELEGATION', 'CREATE_DELEGATION_SUCCEED', 'CREATE_DELEGATION_FAIL'
]);

const initialState = {
  formRequire: {
    tradeModes: [],
    transModes: [],
    declareWayModes: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function createDelegation({delegationInfo, tenantInfo, delg_type}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_DELEGATION,
        actionTypes.CREATE_DELEGATION_SUCCEED,
        actionTypes.CREATE_DELEGATION_FAIL
      ],
      endpoint: 'v1/cms/delegation/create',
      method: 'post',
      data: { delegationInfo, tenantInfo, delg_type }
    }
  };
}
