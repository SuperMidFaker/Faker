import React, { Component } from 'react';
import { connect } from 'react-redux';
import InvitationList from '../components/InvitationList';
import inviteModal from '../components/inviteModal';
import { changeInvitationType, loadToInvites, inviteOfflinePartner, removeInvitee } from 'common/reducers/invitation';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ state, dispatch }) {
  return dispatch(loadToInvites(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect((state) => ({
  invitationType: state.invitation.invitationType,
  toInvites: state.invitation.toInvites,
  tenantId: state.account.tenantId
}), { changeInvitationType, inviteOfflinePartner, removeInvitee })
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
    }
  }
  render() {
    const { invitationType = '0', toInvites } = this.props;
    return (
      <InvitationList
        invitationType={invitationType}
        toInvites={toInvites}
        onInviteBtnClick={this.handleInviteBtnClick}
        onInvitationTypeChange={this.handleInvitationTypeChange}/>
    );
  }
}
