import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Col, Row, Tabs, Button, Menu, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CWM_SO_STATUS } from 'common/constants';
import { hideDock, changeDockTab, getSo, getSoUuid, getShipmtOrderNo, cancelOutbound, closeOutbound } from 'common/reducers/cwmShippingOrder';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import OrderPane from './tabpane/orderPane';
import FTZPane from './tabpane/ftzPane';
import OutboundPane from './tabpane/outboundPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    dock: state.cwmShippingOrder.dock,
    visible: state.cwmShippingOrder.dock.visible,
    tabKey: state.cwmShippingOrder.dock.tabKey,
    order: state.cwmShippingOrder.dock.order,
    defaultWhse: state.cwmContext.defaultWhse,
    uuid: state.cwmShippingOrder.dock.order.uuid,
  }),
  { hideDock, changeDockTab, getSo, getSoUuid, getShipmtOrderNo, loadOrderDetail, cancelOutbound, closeOutbound }
)
export default class ShippingDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    dock: PropTypes.object.isRequired,
    hideDock: PropTypes.func.isRequired,
    changeDockTab: PropTypes.func.isRequired,
    cancelOutbound: PropTypes.func.isRequired,
    closeOutbound: PropTypes.func.isRequired,
  }
  state = {
    soHead: {},
    soBody: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.order.so_no && !this.props.visible && nextProps.visible) {
      this.props.getSoUuid(nextProps.order.so_no);
      this.props.getSo(nextProps.order.so_no).then(
        (result) => {
          if (!result.error) {
            this.setState({
              soHead: result.data.soHead ? result.data.soHead : {},
              soBody: result.data.soBody,
            });
          }
        }
      );
    }
  }
  componentWillUnmount() {
    this.props.hideDock();
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.props.changeDockTab(tabKey);
  }
  handleClose = () => {
    this.props.hideDock();
  }
  cancelOutbound = (soNo) => {
    this.props.cancelOutbound({
      so_no: soNo,
      login_id: this.props.loginId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  closeOutbound = (soNo) => {
    const { tenantId, loginName } = this.props;
    this.props.closeOutbound({
      so_no: soNo, tenantId, loginName,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleMenuClick = (e) => {
    const { soHead } = this.state;
    if (e.key === 'cancel') {
      Modal.confirm({
        title: '确认取订单?',
        content: '确认后此订单的相关信息将会被删除',
        onOk: () => {
          this.cancelOutbound(soHead.so_no);
        },
        onCancel() {},
      });
    } else if (e.key === 'close') {
      Modal.confirm({
        title: '确认关订单?',
        content: '确认后此订单将会被提前完成',
        onOk: () => {
          this.closeOutbound(soHead.so_no);
        },
        onCancel() {},
      });
    }
  }
  goHomeDock = () => {
    const { uuid } = this.props;
    this.props.getShipmtOrderNo(uuid).then(
      (result) => {
        this.props.loadOrderDetail(result.data.order_no, this.props.tenantId);
        this.props.hideDock();
      }
    );
  }
  renderStatus(status) {
    switch (status) {
      case CWM_SO_STATUS.PENDING.value: return CWM_SO_STATUS.PENDING.badge;
      case CWM_SO_STATUS.OUTBOUND.value: return CWM_SO_STATUS.OUTBOUND.badge;
      case CWM_SO_STATUS.PARTIAL.value: return CWM_SO_STATUS.PARTIAL.badge;
      case CWM_SO_STATUS.COMPLETED.value: return CWM_SO_STATUS.COMPLETED.badge;
      default: return 'default';
    }
  }
  renderStatusMsg(status) {
    switch (status) {
      case CWM_SO_STATUS.PENDING.value: return CWM_SO_STATUS.PENDING.text;
      case CWM_SO_STATUS.OUTBOUND.value: return CWM_SO_STATUS.OUTBOUND.text;
      case CWM_SO_STATUS.PARTIAL.value: return CWM_SO_STATUS.PARTIAL.text;
      case CWM_SO_STATUS.COMPLETED.value: return CWM_SO_STATUS.COMPLETED.text;
      default: return '';
    }
  }
  renderTabs() {
    const { soHead, soBody } = this.state;
    const { order } = this.props;
    const tabs = [];
    tabs.push(
      <TabPane tab={this.msg('tabSO')} key="order">
        <OrderPane soHead={soHead} soBody={soBody} />
      </TabPane>);
    if (soHead.bonded) {
      tabs.push(
        <TabPane tab={this.msg('tabFTZ')} key="ftz">
          <FTZPane soNo={order.so_no} />
        </TabPane>);
    }
    if (soHead.status > CWM_SO_STATUS.PENDING.value) {
      tabs.push(
        <TabPane tab={this.msg('tabOutbound')} key="outbound">
          <OutboundPane outboundNo={order.outboundNo} />
        </TabPane>);
    }
    return (
      <Tabs defaultActiveKey="order" onChange={this.handleTabChange}>
        {tabs}
      </Tabs>
    );
  }

  renderExtra() {
    const { defaultWhse } = this.props;
    const { soHead } = this.state;
    return (
      <Row>
        <Col span="8">
          <InfoItem label="仓库" field={defaultWhse.name} />
        </Col>
        <Col span="8">
          <InfoItem label="货主" field={soHead.owner_name} />
        </Col>
        <Col span="4">
          <InfoItem label="货物属性" field={soHead.bonded ? '保税' : '非保税'} />
        </Col>
        <Col span="4">
          <InfoItem label="创建时间" addonBefore={<Icon type="calendar" />} field={moment(soHead.created_date).format('YYYY/MM/DD HH:mm')} />
        </Col>
      </Row>);
  }
  renderTitle = () => {
    const { uuid, order } = this.props;
    const button = uuid ? <Button shape="circle" icon="home" onClick={this.goHomeDock} /> : '';
    return (
      <span>{button}<span>{order.so_no}</span></span>
    );
  }
  renderMenu() {
    const { soHead } = this.state;
    const menuItems = [];
    if (soHead.status === CWM_SO_STATUS.PENDING.value || soHead.status === CWM_SO_STATUS.OUTBOUND.value) {
      menuItems.push(<Menu.Item key="cancel"><Icon type="delete" />取消订单</Menu.Item>);
    } else if (soHead.status === CWM_SO_STATUS.PARTIAL.value) {
      menuItems.push(<Menu.Item key="close"><Icon type="close-square" />关闭订单</Menu.Item>);
    }
    menuItems.push(<Menu.Item key="export"><Icon type="export" />导出订单</Menu.Item>);
    return <Menu onClick={this.handleMenuClick}>{menuItems}</Menu>;
  }
  render() {
    const { visible } = this.props;
    const { soHead } = this.state;
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hideDock}
        title={this.renderTitle()}
        status={this.renderStatus(soHead.status)}
        statusText={this.renderStatusMsg(soHead.status)}
        overlay={this.renderMenu()}
        extra={this.renderExtra()}
      >
        {this.renderTabs()}
      </DockPanel>
    );
  }
}
