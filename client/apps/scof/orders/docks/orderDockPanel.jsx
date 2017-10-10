import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon, Col, Row, Tabs, Tooltip, message } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { CRM_ORDER_STATUS, SCOF_ORDER_TRANSFER } from 'common/constants';
import { hideDock, changeDockTab, cancelOrder, closeOrder } from 'common/reducers/crmOrders';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import OrderPane from './tabpanes/orderPane';
import FlowPane from './tabpanes/flowPane';
import BillingPane from './tabpanes/billingPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import '../orders.less';

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
  }),
  { hideDock, changeDockTab, cancelOrder, closeOrder }
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
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.props.changeDockTab(tabKey);
  }
  handleClose = () => {
    this.props.hideDock();
  }
  handleCancelOrder = () => {
    this.props.cancelOrder(this.props.order.shipmt_order_no, this.props.tenantId).then(
      (result) => {
        if (!result.error) {
          message.info('订单已取消');
          this.props.hideDock();
          if (this.props.reload) {
            this.props.reload();
          }
        }
      }
    );
  }
  handleCloseOrder = () => {
    this.props.closeOrder(this.props.order.shipmt_order_no, this.props.tenantId).then(
      (result) => {
        if (!result.error) {
          message.info('订单已关闭');
          this.props.hideDock();
        }
      }
    );
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
    const { order } = this.props;
    return (
      <Tabs defaultActiveKey="flow" onChange={this.handleTabChange}>
        <TabPane tab={this.msg('tabFlow')} key="flow">
          <FlowPane />
        </TabPane>
        <TabPane tab={this.msg('tabOrder')} key="order">
          <OrderPane />
          {
            order.order_status === CRM_ORDER_STATUS.processing ? (
              <div className="pane-content order-action-btn">
                <Tooltip title="取消订单后，该订单将会被删除">
                  <Button size="large" onClick={this.handleCancelOrder}>取消订单</Button>
                </Tooltip>
                <Tooltip title="关闭订单后订单会被提前结束，但是订单不会被删除">
                  <Button size="large" onClick={this.handleCloseOrder}>关闭订单</Button>
                </Tooltip>
              </div>) : null
          }
        </TabPane>
        <TabPane tab={this.msg('tabBilling')} key="billing" disabled>
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
    // const transMode = TRANS_MODE.filter(tm => tm.value === order.cust_shipmt_trans_mode)[0];
    // const wbNo = order.cust_shipmt_bill_lading || (order.cust_shipmt_hawb ? `${order.cust_shipmt_mawb}_${order.cust_shipmt_hawb}` : order.cust_shipmt_mawb);
    return (
      <Row>
        <Col span="8">
          <InfoItem label="客户" field={order.customer_name} />
        </Col>
        <Col span="6">
          <InfoItem label="客户订单号" field={order.cust_order_no} />
        </Col>
        <Col span="4">
          <InfoItem label="货物流向" addonBefore={transfer && <Icon type={transfer.icon} />} field={transfer && transfer.text} />
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
        {visible && this.renderTabs()}
      </DockPanel>
    );
  }
}
