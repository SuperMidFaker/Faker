import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Col, Menu, Modal, Row, Tabs, message } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { CRM_ORDER_STATUS, SCOF_ORDER_TRANSFER } from 'common/constants';
import { hideDock, changeDockTab, cancelOrder, closeOrder } from 'common/reducers/sofOrders';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import { Logixon } from 'client/components/FontIcon';
import OrderPane from './tabpanes/orderPane';
import FlowPane from './tabpanes/flowPane';
import AttachmentPane from './tabpanes/attachmentPane';
import { formatMsg } from '../message.i18n';

const { TabPane } = Tabs;
function renderStatus(status) {
  switch (status) {
    case CRM_ORDER_STATUS.created: return 'default';
    case CRM_ORDER_STATUS.processing: return 'processing';
    case CRM_ORDER_STATUS.finished: return 'success';
    default: return 'default';
  }
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    dock: state.sofOrders.dock,
    visible: state.sofOrders.dock.visible,
    tabKey: state.sofOrders.dock.tabKey,
    order: state.sofOrders.dock.order,
  }),
  {
    hideDock, changeDockTab, cancelOrder, closeOrder,
  }
)
export default class ShipmentDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    hideDock: PropTypes.func.isRequired,
    changeDockTab: PropTypes.func.isRequired,
    order: PropTypes.shape({
      shipmt_order_no: PropTypes.string,
    }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleTabChange = (tabKey) => {
    this.props.changeDockTab(tabKey);
  }
  handleClose = () => {
    this.props.hideDock();
  }
  handleMenuClick = (e) => {
    if (e.key === 'cancel') {
      Modal.confirm({
        title: '确认取消订单?',
        content: '取消订单后，该订单将会被删除',
        onOk: () => {
          this.handleCancelOrder();
        },
        onCancel() {},
      });
    } else if (e.key === 'close') {
      Modal.confirm({
        title: '确认关闭订单?',
        content: '关闭订单后订单会被提前结束，但是订单不会被删除',
        onOk: () => {
          this.handleCloseOrder();
        },
        onCancel() {},
      });
    }
  }
  handleCancelOrder = () => {
    this.props.cancelOrder(this.props.order.shipmt_order_no, this.props.tenantId).then((result) => {
      if (!result.error) {
        message.info('订单已取消');
        this.props.hideDock();
        if (this.props.reload) {
          this.props.reload();
        }
      }
    });
  }
  handleCloseOrder = () => {
    this.props.closeOrder(this.props.order.shipmt_order_no, this.props.tenantId).then((result) => {
      if (!result.error) {
        message.info('订单已关闭');
        this.props.hideDock();
      }
    });
  }
  renderMenu() {
    const { order } = this.props;
    const menuItems = [];
    if (order.order_status === CRM_ORDER_STATUS.processing) {
      menuItems.push(<Menu.Item key="cancel"><Icon type="delete" />取消订单</Menu.Item>);
      menuItems.push(<Menu.Item key="close"><Icon type="close-square" />关闭订单</Menu.Item>);
    }
    menuItems.push(<Menu.Item key="share"><Icon type="share-alt" /><span onClick={this.handleExportExcel}>共享订单</span></Menu.Item>);
    return <Menu onClick={this.handleMenuClick}>{menuItems}</Menu>;
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
      <Tabs defaultActiveKey="flow" onChange={this.handleTabChange}>
        <TabPane tab={this.msg('tabOrder')} key="order">
          <OrderPane />
        </TabPane>
        <TabPane tab={this.msg('tabFlow')} key="flow">
          <FlowPane />
        </TabPane>
        <TabPane tab={this.msg('tabAttachment')} key="attachment">
          <AttachmentPane />
        </TabPane>
      </Tabs>
    );
  }
  renderExtra() {
    const { order } = this.props;
    const transfer = SCOF_ORDER_TRANSFER.filter(sot => sot.value === order.cust_shipmt_transfer)[0];
    return (
      <Row>
        <Col span="8">
          <InfoItem label="客户" field={order.customer_name} />
        </Col>
        <Col span="6">
          <InfoItem label="客户单号" field={order.cust_order_no} />
        </Col>
        <Col span="4">
          <InfoItem label="订单类型" addonBefore={transfer && <Icon type={transfer.icon} />} field={transfer && transfer.text} />
        </Col>
        <Col span="6">
          <InfoItem label="订单日期" addonBefore={<Icon type="calendar" />} field={moment(order.delg_time).format('YYYY.MM.DD')} />
        </Col>
      </Row>);
  }

  render() {
    const { order, visible } = this.props;
    return (
      <DockPanel
        size="large"
        visible={visible}
        onClose={this.props.hideDock}
        title={<span><Logixon type="dan" /> {order.shipmt_order_no}</span>}
        overlay={this.renderMenu()}
        status={renderStatus(order.order_status)}
        statusText={this.renderStatusMsg(order.order_status)}
        extra={this.renderExtra()}
      >
        {visible && this.renderTabs()}
      </DockPanel>
    );
  }
}
