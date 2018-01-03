import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Breadcrumb, Layout, Card, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,

  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'bss',
  jumpOut: true,
})
export default class ReceivableBillDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    activeTab: '',
    summary: {},
  }

  msg = key => formatMsg(this.props.intl, key);

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }

  render() {
    const { summary } = this.state;

    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('payable')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('payableBill')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.orderRelNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16 }} >
            <DescriptionList col={4}>
              <Description term="货主">{summary.owner_name}</Description>
              <Description term="ASN编号">{summary.asn_no}</Description>
              <Description term="总预期数量">{summary.total_expect_qty}</Description>
              <Description term="总实收数量">{summary.total_received_qty}</Description>

              <Description term="创建时间">{summary.created_date && moment(summary.created_date).format('YYYY.MM.DD HH:mm')}</Description>
              <Description term="入库时间">{summary.completed_date && moment(summary.completed_date).format('YYYY.MM.DD HH:mm')}</Description>
            </DescriptionList>
          </Card>
          <MagicCard bodyStyle={{ padding: 0 }} >
            <Tabs activeKey={this.state.activeTab} onChange={this.handleTabChange}>
              <TabPane tab="应收明细" key="receiveDetails" />
              <TabPane tab="应付明细" key="putawayDetails" />
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
