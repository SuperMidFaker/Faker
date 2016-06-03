import React, { Component } from 'react';
import { connect } from 'react-redux';
import InvitationList from '../components/InvitationList';
import { changeInvitationType, loadToInvites } from 'common/reducers/invitation';
import connectFetch from 'client/common/decorators/connect-fetch';

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadToInvites(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect((state) => ({
  invitationType: state.invitation.invitationType,
  toInvites: state.invitation.toInvites
}), { changeInvitationType })
export default class InvitationListContainer extends Component {
  handleInvitationTypeChange = (invitationType) => {
    this.props.changeInvitationType(invitationType);
  }
  handleInviteBtnClick = (invitationId) => {
    console.log(invitationId);
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
