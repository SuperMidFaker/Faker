import React, { Component } from 'react';
import { connect } from 'react-redux';
import InvitationList from '../components/InvitationList';
import inviteModal from '../components/inviteModal';
import { changeInvitationType, loadToInvites, inviteOfflinePartner, inviteOnlinePartner, removeInvitee, cancelInvite,
  loadSendInvitations, loadReceiveInvitations, rejectInvitation, acceptInvitation } from 'common/reducers/invitation';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadToInvites(state.account.tenantId)));
  promises.push(dispatch(loadSendInvitations(state.account.tenantId)));
  promises.push(dispatch(loadReceiveInvitations(state.account.tenantId)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect((state) => ({
  invitationType: state.invitation.invitationType,
  toInvites: state.invitation.toInvites,
  sendInvitations: state.invitation.sendInvitations,
  receiveInvitations: state.invitation.receiveInvitations,
  tenantId: state.account.tenantId
}), { changeInvitationType, inviteOfflinePartner, inviteOnlinePartner, removeInvitee, cancelInvite, rejectInvitation, acceptInvitation })
export default class InvitationListContainer extends Component {
  handleInvitationTypeChange = (invitationType) => {
    this.props.changeInvitationType(invitationType);
  }
  handleInviteBtnClick = (inviteeInfo) => {
    const { tenantId } = this.props;
    if (inviteeInfo.tenantId === -1) { // 线下邀请
      inviteModal({
        onOk: (contactInfo) => {
          this.props.inviteOfflinePartner({tenantId, contactInfo, inviteeInfo});
          this.props.removeInvitee(inviteeInfo);
        }
      });
    } else { // 线上邀请
      this.props.inviteOnlinePartner({tenantId, inviteeInfo});
    }
  }
  handleCancelInvitebtnClick = (id) => {
    this.props.cancelInvite(id);
  }
  handleAcceptBtnClick = (id) => {
    this.props.acceptInvitation(id);
  }
  handleRejectBtnClick = (id) => {
    this.props.rejectInvitation(id);
  }
  render() {
    const { invitationType = '0', toInvites, sendInvitations, receiveInvitations } = this.props;
    return (
      <InvitationList
        invitationType={invitationType}
        toInvites={toInvites}
        receiveInvitations={receiveInvitations}
        sendInvitations={sendInvitations}
        onInviteBtnClick={this.handleInviteBtnClick}
        onAcceptBtnClick={this.handleAcceptBtnClick}
        onRejectBtnClick={this.handleRejectBtnClick}
        onCancelInviteBtnClick={this.handleCancelInvitebtnClick}
        onInvitationTypeChange={this.handleInvitationTypeChange}/>
    );
  }
}
