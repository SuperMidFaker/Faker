import React, { Component } from 'react';
import { loadPartners } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Card, Icon, Radio, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { changeInvitationType } from 'common/reducers/invitation';
import PageHeader from 'client/components/PageHeader';
import withPrivilege from 'client/common/decorators/withPrivilege';
import HubSiderMenu from '../menu';
import ToInviteList from './toInviteList';
import ReceivedInvitationList from './receivedInvitationList';
import SentInvitationList from './sentInvitationList';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role: '',
    businessType: '',
  }));
}

@injectIntl
@connectFetch()(fetchData)
@connect(state => ({
  invitationType: state.invitation.invitationType,
}), { changeInvitationType })
@withPrivilege({ module: 'corp', feature: 'partners' })
export default class MainContainer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleInvitationTypeChange = (e) => {
    this.props.changeInvitationType(e.target.value);
  }
  render() {
    const { invitationType = '0' } = this.props;
    const components = [
      <ToInviteList />,
      <ReceivedInvitationList />,
      <SentInvitationList />,
    ];
    const content = components[invitationType];
    return (
      <Layout>
        <HubSiderMenu currentKey="partners" />
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Icon type="team" /> {this.msg('collab')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Nav>
              <RadioGroup defaultValue={invitationType} onChange={this.handleInvitationTypeChange}>
                <RadioButton value="0">待邀请</RadioButton>
                <RadioButton value="1">收到的邀请</RadioButton>
                <RadioButton value="2">发出的邀请</RadioButton>
              </RadioGroup>
            </PageHeader.Nav>
          </PageHeader>
          <Content className="page-content">
            <QueueAnim type="right">
              <Card bodyStyle={{ padding: 0 }} className="table-fixed-layout">
                {content}
              </Card>
            </QueueAnim>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
