import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Layout, Card, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { Description } = DescriptionList;

const { TabPane } = Tabs;

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

  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }

  render() {
    const { summary } = this.state;

    return (
      <div>
        <PageHeader breadcrumb={[this.msg('bill'), this.msg('createBill')]}>
          <PageHeader.Actions />
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
          <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
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
