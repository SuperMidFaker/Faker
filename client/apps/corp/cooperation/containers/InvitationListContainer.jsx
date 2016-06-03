import React, { Component } from 'react';
import { connect } from 'react-redux';
import InvitationList from '../components/InvitationList';

export default class InvitationListContainer extends Component {
  render() {
    return (
      <InvitationList invitationType="2" />
    );
  }
}
