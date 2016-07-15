import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/invitation/', [
  'CHANGE_INVITATION_TYPE',
  'LOAD_TO_INVITES', 'LOAD_TO_INVITES_SUCCEED', 'LOAD_TO_INVITES_FAIL',
  'INVITE_OFFLINE_PARTNER', 'INVITE_OFFLINE_PARTNER_SUCCEED', 'INVITE_OFFLINE_PARTNER_FAIL',
  'INVITE_ONLINE_PARTNER', 'INVITE_ONLINE_PARTNER_SUCCEED', 'INVITE_ONLINE_PARTNER_FAIL',
  'CANCEL_INVITE', 'CANCEL_INVITE_SUCCEED', 'CANCEL_INVITE_FAIL',
  'LOAD_SEND_INVITATIONS', 'LOAD_SEND_INVITATIONS_SUCCEED', 'LOAD_SEND_INVITATIONS_FAIL',
  'LOAD_RECEIVE_INVITATIONS', 'LOAD_RECEIVE_INVITATIONS_SUCCEED', 'LOAD_RECEIVE_INVITATIONS_FAIL',
  'REJECT_INVITATION', 'REJECT_INVITATION_SUCCEED', 'REJECT_INVITATION_FAIL',
  'ACCEPT_INVITATION', 'ACCEPT_INVITATION_SUCCEED', 'ACCEPT_INVITATION_FAIL',
]);

const initialState = {
  invitationType: '0',    // 表示当前被选中的邀请类型, '0'-'待邀请', '1'-'收到的邀请', '2'-'发出的邀请'
  toInvites: [],          // 待邀请的列表数组
  sendInvitations: [],    // 发出的邀请列表数组
  receiveInvitations: [],  // 收到的邀请
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CHANGE_INVITATION_TYPE:
      return { ...state, invitationType: action.invitationType };
    case actionTypes.LOAD_TO_INVITES_SUCCEED:
      return { ...state, toInvites: action.result.data.toInvites };
    case actionTypes.INVITE_ONLINE_PARTNER_SUCCEED:
    case actionTypes.INVITE_OFFLINE_PARTNER_SUCCEED: {
      const { partnerId } = action;
      const toInvites = state.toInvites.filter(invitee => invitee.partner_id !== partnerId);
      return { ...state, toInvites };
    }
    case actionTypes.LOAD_SEND_INVITATIONS_SUCCEED:
      return { ...state, sendInvitations: action.result.data.sendInvitations };
    case actionTypes.CANCEL_INVITE_SUCCEED: {
      const sendInvitations = state.sendInvitations;
      const cancelInvitation = sendInvitations.find(invitation => invitation.id === action.id);
      const index = sendInvitations.findIndex(invitaion => invitaion.id === action.id);
      const newInvitation = { ...cancelInvitation, status: 3 };
      return { ...state, sendInvitations: [...sendInvitations.slice(0, index), newInvitation, ...sendInvitations.slice(index + 1)] };
    }
    case actionTypes.LOAD_RECEIVE_INVITATIONS_SUCCEED:
      return { ...state, receiveInvitations: action.result.data.receiveInvitations };
    case actionTypes.ACCEPT_INVITATION_SUCCEED:
    case actionTypes.REJECT_INVITATION_SUCCEED: {
      const recevieInvitaions = state.receiveInvitations;
      const updateInvitation = recevieInvitaions.find(invitation => invitation.id === action.id);
      const index = recevieInvitaions.findIndex(invitaion => invitaion.id === action.id);
      const newInvitation = { ...updateInvitation, status: action.status };
      return { ...state, receiveInvitations: [...recevieInvitaions.slice(0, index), newInvitation, ...recevieInvitaions.slice(index + 1)] };
    }
    default:
      return state;
  }
}

export function changeInvitationType(invitationType) {
  return {
    type: actionTypes.CHANGE_INVITATION_TYPE,
    invitationType,
  };
}

// 待邀请相关的action
export function loadToInvites(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TO_INVITES,
        actionTypes.LOAD_TO_INVITES_SUCCEED,
        actionTypes.LOAD_TO_INVITES_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/to_invites',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function inviteOfflinePartner({ tenantId, inviteeInfo, contactInfo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INVITE_OFFLINE_PARTNER,
        actionTypes.INVITE_OFFLINE_PARTNER_SUCCEED,
        actionTypes.INVITE_OFFLINE_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/invite_offline_partner',
      method: 'post',
      partnerId: inviteeInfo.partnerId,
      data: {
        tenantId,
        inviteeInfo,
        contactInfo,
      },
    },
  };
}

export function inviteOnlinePartner({ tenantId, inviteeInfo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INVITE_ONLINE_PARTNER,
        actionTypes.INVITE_ONLINE_PARTNER_SUCCEED,
        actionTypes.INVITE_ONLINE_PARTNER_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/invite_online_partner',
      method: 'post',
      partnerId: inviteeInfo.partnerId,
      data: {
        tenantId,
        inviteeInfo,
      },
    },
  };
}

export function removeInvitee(inviteeInfo) {
  return {
    type: actionTypes.REMOVE_INVITEE,
    inviteeInfo,
  };
}

// 收到的邀请相关的action
export function loadReceiveInvitations(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RECEIVE_INVITATIONS,
        actionTypes.LOAD_RECEIVE_INVITATIONS_SUCCEED,
        actionTypes.LOAD_RECEIVE_INVITATIONS_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/receive_invitations',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function acceptInvitation(id, partnerId, reversePartnerships) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCEPT_INVITATION,
        actionTypes.ACCEPT_INVITATION_SUCCEED,
        actionTypes.ACCEPT_INVITATION_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/accept_invitation',
      method: 'post',
      id,
      status: 1,
      data: { id, partnerId, reversePartnerships },
    },
  };
}

export function rejectInvitation(id, partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REJECT_INVITATION,
        actionTypes.REJECT_INVITATION_SUCCEED,
        actionTypes.REJECT_INVITATION_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/reject_invitation',
      method: 'post',
      id,
      status: 2,
      data: { id, partnerId },
    },
  };
}

// 发出邀请相关action
export function loadSendInvitations(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SEND_INVITATIONS,
        actionTypes.LOAD_SEND_INVITATIONS_SUCCEED,
        actionTypes.LOAD_SEND_INVITATIONS_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/send_invitations',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function cancelInvite(id, partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_INVITE,
        actionTypes.CANCEL_INVITE_SUCCEED,
        actionTypes.CANCEL_INVITE_FAIL,
      ],
      endpoint: 'v1/cooperation/invitation/cancel_invite',
      method: 'post',
      id,
      data: {
        id,
        partnerId,
      },
    },
  };
}
