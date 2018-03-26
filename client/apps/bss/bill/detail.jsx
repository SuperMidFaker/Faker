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
import { getBill } from 'common/reducers/bssBill';
import StatementsPane from './tabpane/statementsPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { Description } = DescriptionList;
const { Step } = Steps;
const { TabPane } = Tabs;

@injectIntl
@connect(
  () => ({
  }),
  { getBill }
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
    billHead: {},
    billDetails: [],
  }
  componentDidMount() {
    this.props.getBill(this.props.params.billNo).then((result) => {
      if (!result.error) {
        this.setState({
          billHead: result.data.head,
          billDetails: result.data.details,
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleBillChange = (billHead) => {
    this.setState({
      billHead,
    });
  }
  render() {
    const { billHead } = this.state;

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
              <Description term="账单名称">{billHead.bill_title}</Description>
              <Description term="客户">{billHead.buyer_name}</Description>
              <Description term="账期">{billHead.order_begin_date && moment(billHead.order_begin_date).format('YYYY.MM.DD')} ~ {billHead.order_end_date && moment(billHead.order_end_date).format('YYYY.MM.DD')}</Description>
              <Description term="类型">{billHead.bill_type}</Description>
              <Description term="订单数量">{billHead.order_count}</Description>
              <Description term="账单总金额">{billHead.total_amount}</Description>
              <Description term="调整金额">{billHead.adjusted_amount}</Description>
              <Description term="最终结算金额">{billHead.final_amount}</Description>
            </DescriptionList>
            <Steps progressDot current={this.state.billHead.status} className="progress-tracker">
              <Step title="草稿" />
              <Step title="对账中" />
              <Step title="已接受" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="statements">
                <TabPane tab="费用清单" key="statements" >
                  <StatementsPane
                    billDetails={this.state.billDetails}
                    billHead={this.state.billHead}
                    billNo={this.props.params.billNo}
                    handleBillChange={this.handleBillChange}
                  />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
