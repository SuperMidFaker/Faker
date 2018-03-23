import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Layout, Steps, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import ReconciliationPane from './tabpane/reconciliationPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { Description } = DescriptionList;
const { Step } = Steps;
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
    bill: {},
  }

  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  render() {
    const { bill } = this.state;

    return (
      <Layout>
        <PageHeader breadcrumb={[this.msg('bill'), this.props.params.billNo]}>
          <PageHeader.Actions>
            <Button icon="mail" onClick={this.handleCreateASN}>
              {this.msg('发送账单')}
            </Button>
            <Button type="primary" icon="check-circle-o" onClick={this.handleCreateASN}>
              {this.msg('对账确认')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={4}>
              <Description term="账单名称">{bill.title}</Description>
              <Description term="客户">{bill.buyer_name}</Description>
              <Description term="账期">{bill.order_begin_date && moment(bill.order_begin_date).format('YYYY.MM.DD')} ~ {bill.order_end_date && moment(bill.order_end_date).format('YYYY.MM.DD')}</Description>
              <Description term="类型">{bill.bill_type}</Description>
              <Description term="订单数量">{bill.order_count}</Description>
              <Description term="账单金额合计">{bill.total_amount}</Description>
              <Description term="调整金额">{bill.adjusted_amount}</Description>
              <Description term="最终结算金额">{bill.final_amount}</Description>
            </DescriptionList>
            <Steps progressDot current={1} className="progress-tracker">
              <Step title="草稿" />
              <Step title="对账中" />
              <Step title="已接受" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="unaccepted" onChange={this.handleTabChange}>
                <TabPane tab="待我方认可" key="unaccepted" >
                  <ReconciliationPane status="unaccepted" />
                </TabPane>
                <TabPane tab="需对方认可" key="accepted" >
                  <ReconciliationPane status="accepted" />
                </TabPane>
                <TabPane tab="双方已认可" key="bothAccepted" >
                  <ReconciliationPane status="bothAccepted" />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
