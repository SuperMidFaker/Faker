import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/shftz/', [
  'SHOW_NRSPLIT_MODAL',
  'LOAD_NREPO', 'LOAD_NREPO_SUCCEED', 'LOAD_NREPO_FAIL',
  'SUBMIT_NMRSPL', 'SUBMIT_NMRSPL_SUCCEED', 'SUBMIT_NMRSPL_FAIL',
  'UNDO_NMRSPL', 'UNDO_NMRSPL_SUCCEED', 'UNDO_NMRSPL_FAIL',
]);

const initialState = {
  submitting: false,
  normalRegMSModal: {
    visible: false,
    pre_entry_seq_no: '',
    owner: {
      tenant_id: null,
      partner_id: null,
    },
  },
  normalRegMSRepos: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_NRSPLIT_MODAL:
      return { ...state, normalRegMSModal: { ...state.normalRegMSModal, ...action.data } };
    case actionTypes.LOAD_NREPO_SUCCEED:
      return { ...state, normalRegMSRepos: action.result.data };
    default:
      return state;
  }
}

export function showNormalRegSplitModal(modal) {
  return {
    type: actionTypes.SHOW_NRSPLIT_MODAL,
    data: modal,
  };
}

export function loadNormalRegMSRepos(owner) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_NREPO,
        actionTypes.LOAD_NREPO_SUCCEED,
        actionTypes.LOAD_NREPO_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/owner/repos',
      method: 'get',
      params: {
        owner_partner_id: owner.partner_id,
        owner_tenant_id: owner.tenant_id,
      },
    },
  };
}

export function submitNormalRegSplit(submit) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_NMRSPL,
        actionTypes.SUBMIT_NMRSPL_SUCCEED,
        actionTypes.SUBMIT_NMRSPL_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/normal/reg/splitmerge',
      method: 'post',
      data: submit,
    },
  };
}

export function undoNormalRegSplit(soNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UNDO_NMRSPL,
        actionTypes.UNDO_NMRSPL_SUCCEED,
        actionTypes.UNDO_NMRSPL_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/normal/reg/split/undo',
      method: 'post',
      data: { soNo },
    },
  };
}
