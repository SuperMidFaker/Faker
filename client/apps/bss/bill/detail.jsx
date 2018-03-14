import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Col, Row, Layout, Card, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import FeeDetailPane from './tabpane/feeDetailPane';
import OrderListPane from './tabpane/orderListPane';
import InvoiceListPane from './tabpane/invoiceListPane';
import PaymentReceivedPane from './tabpane/paymentReceivedPane';
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
    summary: {},
  }

  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  render() {
    const { summary } = this.state;

    return (
      <div>
        <PageHeader breadcrumb={[this.msg('receivable'), this.props.params.billNo]}>
          <PageHeader.Actions>
            <Button icon="mail" onClick={this.handleCreateASN}>
              {this.msg('发送账单')}
            </Button>
            <Button type="primary" icon="check-circle-o" onClick={this.handleCreateASN}>
              {this.msg('对账确认')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16 }} >
            <Row type="flex">
              <Col span={16}>
                <DescriptionList col={4}>
                  <Description term="账单编号">{summary.asn_no}</Description>
                  <Description term="客户">{summary.owner_name}</Description>
                  <Description term="账单期间">{summary.created_date && moment(summary.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                </DescriptionList>
              </Col>
              <Col span={8} className="extra">
                <div>
                  <p>账单金额</p>
                  <p>5,680</p>
                </div>
                <div>
                  <p>调整金额</p>
                  <p>2,890</p>
                </div>
                <div>
                  <p>最终金额</p>
                  <p>2,223</p>
                </div>
              </Col>
            </Row>
          </Card>
          <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="orderList" onChange={this.handleTabChange}>
              <TabPane tab="结算订单" key="orderList" >
                <OrderListPane />
              </TabPane>
              <TabPane tab="费用明细" key="feeDetail" >
                <FeeDetailPane />
              </TabPane>
              <TabPane tab="发票" key="invoiceList" >
                <InvoiceListPane />
              </TabPane>
              <TabPane tab="实收款" key="paymentReceived" >
                <PaymentReceivedPane />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
