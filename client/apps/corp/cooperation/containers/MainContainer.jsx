import React, { Component } from 'react';
import { loadPartners } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';
import { connect } from 'react-redux';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { changeInvitationType } from 'common/reducers/invitation';
import { Radio, Layout } from 'antd';
import ToInviteListContainer from './ToInviteListContainer';
import ReceiveInvitationListContainer from './ReceiveInvitationListContainer';
import SendInvitationListContainer from './SendInvitationListContainer';

const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    role: '',
    businessType: '',
  }));
}

@connectFetch()(fetchData)
@connect(state => ({
  invitationType: state.invitation.invitationType,
}), { changeInvitationType })
@withPrivilege({ module: 'corp', feature: 'partners' })
export default class MainContainer extends Component {

  handleInvitationTypeChange = (e) => {
    this.props.changeInvitationType(e.target.value);
  }
  render() {
    const { invitationType = '0' } = this.props;
    const components = [
      <ToInviteListContainer />,
      <ReceiveInvitationListContainer />,
      <SendInvitationListContainer />,
    ];
    const content = components[invitationType];
    return (
      <Content className="main-content">
        <div className="page-body">
          <div className="toolbar">
            <RadioGroup defaultValue={invitationType} onChange={this.handleInvitationTypeChange}>
              <RadioButton value="0">待邀请</RadioButton>
              <RadioButton value="1">收到的邀请</RadioButton>
              <RadioButton value="2">发出的邀请</RadioButton>
            </RadioGroup>
          </div>
          <div className="panel-body table-panel">
            {content}
          </div>
        </div>
      </Content>
    );
  }
}
