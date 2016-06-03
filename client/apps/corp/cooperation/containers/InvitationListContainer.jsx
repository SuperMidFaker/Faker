import React, { Component } from 'react';
import { connect } from 'react-redux';
import InvitationList from '../components/InvitationList';
import { changeInvitationType } from 'common/reducers/invitation';

@connect((state) => ({invitationType: state.invitation.invitationType}), { changeInvitationType })
export default class InvitationListContainer extends Component {
  handleInvitationTypeChange = (invitationType) => {
    this.props.changeInvitationType(invitationType);
  }
  render() {
    const { invitationType = '0' } = this.props;
    console.log(this.props);
    return (
      <InvitationList invitationType={invitationType} onInvitationTypeChange={this.handleInvitationTypeChange}/>
    );
  }
}
