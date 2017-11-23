import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Breadcrumb, Col, Row, Layout, Card, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import FeeDetailPane from './tabpane/feeDetailPane';
import OrderListPane from './tabpane/orderListPane';
import InvoiceListPane from './tabpane/invoiceListPane';
import PaymentReceivedPane from './tabpane/paymentReceivedPane';
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
    printed: false,
    activeTab: '',
    fullscreen: true,
    summary: {},
  }

  msg = key => formatMsg(this.props.intl, key);
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }

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
                {this.msg('receivable')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('receivableBill')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.billNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
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
          <Card bodyStyle={{ padding: 16 }} hoverable={false}>
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
          <MagicCard bodyStyle={{ padding: 0 }} hoverable={false} onSizeChange={this.toggleFullscreen}>
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
