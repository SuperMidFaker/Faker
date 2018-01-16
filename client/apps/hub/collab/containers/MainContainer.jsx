import React, { Component } from 'react';
import { loadPartners } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';
import { connect } from 'react-redux';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { changeInvitationType } from 'common/reducers/invitation';
import { Breadcrumb, Icon, Radio, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import HubSiderMenu from '../../menu';
import ToInviteListContainer from './ToInviteListContainer';
import ReceiveInvitationListContainer from './ReceiveInvitationListContainer';
import SendInvitationListContainer from './SendInvitationListContainer';

const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadPartners({
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
      <Layout>
        <HubSiderMenu currentKey="partners" />
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="team" /> 协作邀请
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup defaultValue={invitationType} onChange={this.handleInvitationTypeChange}>
              <RadioButton value="0">待邀请</RadioButton>
              <RadioButton value="1">收到的邀请</RadioButton>
              <RadioButton value="2">发出的邀请</RadioButton>
            </RadioGroup>
            <div className="toolbar-right" />
          </Header>
          <Content className="main-content">
            <QueueAnim type="right">
              <div className="page-body" key="body">
                <div className="panel-body table-panel table-fixed-layout">
                  {content}
                </div>
              </div>
            </QueueAnim>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
