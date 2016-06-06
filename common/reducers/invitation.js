import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/invitation/', [
  'RECEIVEDS_LOAD', 'RECEIVEDS_LOAD_SUCCEED', 'RECEIVEDS_LOAD_FAIL',
  'SENTS_LOAD', 'SENTS_LOAD_SUCCEED', 'SENTS_LOAD_FAIL',
  'INVITATION_CHANGE', 'INVITATION_CHANGE_SUCCEED', 'INVITATION_CHANGE_FAIL',
  'CHANGE_INVITATION_TYPE',
  'LOAD_TO_INVITES', 'LOAD_TO_INVITES_SUCCEED', 'LOAD_TO_INVITES_FAIL',
  'INVITE_OFFLINE_PARTNER', 'INVITE_OFFLINE_PARTNER_SUCCEED', 'INVITE_OFFLINE_PARTNER_FAIL',
  'REMOVE_INVITEE',
  'CANCEL_INVITE', 'CANCEL_INVITE_SUCCEED', 'CANCEL_INVITE_FAIL',
  'LOAD_SEND_INVITATIONS', 'LOAD_SEND_INVITATIONS_SUCCEED', 'LOAD_SEND_INVITATIONS_FAIL'
]);

const initialState = {
  receiveds: {
    loading: false,
    pageSize: 10,
    current: 1,
    totalCount: 0,
    providerTypes: [],
    data: [
      /* { key:, name:, other db column } */
    ]
  },
  sents: {
    loading: false,
    pageSize: 10,
    current: 1,
    totalCount: 0,
    data: [
      /* { key:, name:, other db column } */
    ]
  },
  invitationType: '0', // 表示当前被选中的邀请类型, '0'-'待邀请', '1'-'收到的邀请', '2'-'发出的邀请'
  toInvites: [],       // 待邀请的列表数组
  sendInvitations: [], // 发出的邀请列表数组
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.RECEIVEDS_LOAD:
      return { ...state, receiveds: { ...state.receiveds, loading: true } };
    case actionTypes.RECEIVEDS_LOAD_SUCCEED:
      return {
        ...state,
        receiveds: {
          ...state.receiveds, loading: false, ...action.result.data
        }
      };
    case actionTypes.RECEIVEDS_LOAD_FAIL:
      return { ...state, receiveds: { ...state.receiveds, loading: false } };
    case actionTypes.SENTS_LOAD:
      return { ...state, sents: { ...state.sents, loading: true } };
    case actionTypes.SENTS_LOAD_SUCCEED:
      return {
        ...state,
        sents: {
          ...state.sents, loading: false, ...action.result.data
        }
      };
    case actionTypes.SENTS_LOAD_FAIL:
      return { ...state, sents: { ...state.sents, loading: false } };
    case actionTypes.INVITATION_CHANGE_SUCCEED: {
      const receiveds = { ...state.receiveds };
      receiveds.data[action.index].status = action.result.data;
      return { ...state, receiveds };
    }
    case actionTypes.CHANGE_INVITATION_TYPE:
      return { ...state, invitationType: action.invitationType };
    case actionTypes.LOAD_TO_INVITES_SUCCEED:
      return { ...state, toInvites: action.result.data.toInvites };
    case actionTypes.REMOVE_INVITEE: {
      const removedInvitee = action.inviteeInfo;
      const toInvites = state.toInvites.filter(invitee => !(invitee.code === removedInvitee.code && invitee.name === removedInvitee.name));
      return { ...state, toInvites };
    }
    case actionTypes.LOAD_SEND_INVITATIONS_SUCCEED:
      return { ...state, sendInvitations: action.result.data.sendInvitations };
    case actionTypes.CANCEL_INVITE_SUCCEED: {
      const sendInvitations = state.sendInvitations;
      const cancelInvitation = sendInvitations.find(invitation => invitation.id === action.id);
      const index = sendInvitations.findIndex(invitaion => invitaion.id === action.id);
      const newInvitation = {...cancelInvitation, status: 3};
      return {...state, sendInvitations: [...sendInvitations.slice(0, index), newInvitation, ...sendInvitations.slice(index + 1)]};
    }
    default:
      return state;
  }
}

export function loadReceiveds(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.RECEIVEDS_LOAD, actionTypes.RECEIVEDS_LOAD_SUCCEED,
        actionTypes.RECEIVEDS_LOAD_FAIL],
      endpoint: 'v1/cooperation/invitations/in',
      method: 'get',
      params,
      cookie
    }
  };
}

export function change(key, type, index, partnerships) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.INVITATION_CHANGE, actionTypes.INVITATION_CHANGE_SUCCEED,
        actionTypes.INVITATION_CHANGE_FAIL],
      endpoint: 'v1/cooperation/invitation',
      method: 'post',
      index,
      data: {
        key,
        partnerships,
        type
      }
    }
  };
}

export function loadSents(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SENTS_LOAD, actionTypes.SENTS_LOAD_SUCCEED,
        actionTypes.SENTS_LOAD_FAIL],
      endpoint: 'v1/cooperation/invitations/out',
      method: 'get',
      params,
      cookie
    }
  };
}

export function changeInvitationType(invitationType) {
  return {
    type: actionTypes.CHANGE_INVITATION_TYPE,
    invitationType
  };
}

export function loadToInvites(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TO_INVITES,
        actionTypes.LOAD_TO_INVITES_SUCCEED,
        actionTypes.LOAD_TO_INVITES_FAIL
      ],
      endpoint: 'v1/cooperation/invitation/to_invites',
      method: 'get',
      params: { tenantId }
    }
  };
}

export function inviteOfflinePartner({tenantId, inviteeInfo, contactInfo}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INVITE_OFFLINE_PARTNER,
        actionTypes.INVITE_OFFLINE_PARTNER_SUCCEED,
        actionTypes.INVITE_OFFLINE_PARTNER_FAIL
      ],
      endpoint: 'v1/cooperation/invitation/invite_offline_partner',
      method: 'post',
      data: {
        tenantId,
        inviteeInfo,
        contactInfo
      }
    }
  };
}

export function removeInvitee(inviteeInfo) {
  return {
    type: actionTypes.REMOVE_INVITEE,
    inviteeInfo
  };
}

// 发出邀请相关action
export function loadSendInvitations(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SEND_INVITATIONS,
        actionTypes.LOAD_SEND_INVITATIONS_SUCCEED,
        actionTypes.LOAD_SEND_INVITATIONS_FAIL
      ],
      endpoint: 'v1/cooperation/invitation/send_invitations',
      method: 'get',
      params: { tenantId }
    }
  };
}

export function cancelInvite(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_INVITE,
        actionTypes.CANCEL_INVITE_SUCCEED,
        actionTypes.CANCEL_INVITE_FAIL
      ],
      endpoint: 'v1/cooperation/invitation/cancel_invite',
      method: 'post',
      id,
      data: {
        id
      }
    }
  };
}
