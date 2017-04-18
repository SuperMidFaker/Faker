import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Col, Row, Tabs } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { CRM_ORDER_STATUS, SCOF_ORDER_TRANSFER, TRANS_MODE } from 'common/constants';
import { hideDock, changeDockTab, loadClearanceDetail, loadTransportDetail } from 'common/reducers/crmOrders';
import InfoItem from 'client/components/InfoItem';
import MdIcon from 'client/components/MdIcon';
import DockPanel from 'client/components/DockPanel';
import OrderPane from './tabpanes/orderPane';
import FlowPane from './tabpanes/flowPane';
import BillingPane from './tabpanes/billingPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    dock: state.crmOrders.dock,
    visible: state.crmOrders.dock.visible,
    tabKey: state.crmOrders.dock.tabKey,
    order: state.crmOrders.dock.order,
    delgNos: state.crmOrders.dock.order.ccb_delg_no || '',
    shipmtNos: state.crmOrders.dock.order.trs_shipmt_no || '',
  }),
  { hideDock, changeDockTab, loadClearanceDetail, loadTransportDetail }
)
export default class OrderDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    dock: PropTypes.object.isRequired,
    hideDock: PropTypes.func.isRequired,
    changeDockTab: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
    delgNos: PropTypes.string.isRequired,
    shipmtNos: PropTypes.string.isRequired,
    loadClearanceDetail: PropTypes.func.isRequired,
    loadTransportDetail: PropTypes.func.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.props.changeDockTab(tabKey);
  }
  handleClose = () => {
    this.props.hideDock();
  }
  renderStatus(status) {
    switch (status) {
      case CRM_ORDER_STATUS.created: return 'default';
      case CRM_ORDER_STATUS.processing: return 'processing';
      case CRM_ORDER_STATUS.finished: return 'success';
      default: return 'default';
    }
  }
  renderStatusMsg(status) {
    switch (status) {
      case CRM_ORDER_STATUS.created: return this.msg('created');
      case CRM_ORDER_STATUS.processing: return this.msg('processing');
      case CRM_ORDER_STATUS.finished: return this.msg('finished');
      default: return '';
    }
  }
  renderTabs() {
    return (
      <Tabs defaultActiveKey="order" onChange={this.handleTabChange}>
        <TabPane tab={this.msg('order')} key="order">
          <OrderPane />
        </TabPane>
        <TabPane tab={this.msg('flow')} key="flow">
          <FlowPane />
        </TabPane>
        <TabPane tab={this.msg('billing')} key="billing">
          <BillingPane />
        </TabPane>
      </Tabs>
    );
  }
  renderAlert() {
    return (<Button type="primary">创建清单</Button>);
  }
  renderExtra() {
    const { order } = this.props;
    const transfer = SCOF_ORDER_TRANSFER.filter(sot => sot.value === order.cust_shipmt_transfer)[0];
    const transMode = TRANS_MODE.filter(tm => tm.value === order.cust_shipmt_trans_mode)[0];
    const wbNo = order.cust_shipmt_bill_lading || (order.cust_shipmt_hawb ? `${order.cust_shipmt_mawb}_${order.cust_shipmt_hawb}` : order.cust_shipmt_mawb);
    return (
      <Row>
        <Col span="8">
          <InfoItem label="客户" field={order.customer_name} />
        </Col>
        <Col span="4">
          <InfoItem label="货物流向" addonBefore={transfer && <Icon type={transfer.icon} />} field={transfer && transfer.text} />
        </Col>
        <Col span="6">
          <InfoItem label="提运单号" addonBefore={transMode && <MdIcon type={transMode.icon} />} field={wbNo} />
        </Col>
        <Col span="6">
          <InfoItem label="接单日期" addonBefore={<Icon type="calendar" />} field={moment(order.delg_time).format('YYYY.MM.DD')} />
        </Col>
      </Row>);
  }

  render() {
    const { order, visible } = this.props;
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hideDock}
        title={order.shipmt_order_no}
        status={this.renderStatus(order.order_status)} statusText={this.renderStatusMsg(order.order_status)}
        extra={this.renderExtra()}
        // alert={this.renderAlert()}
      >
        {this.renderTabs()}
      </DockPanel>
    );
  }
}