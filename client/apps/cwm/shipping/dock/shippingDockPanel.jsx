import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Col, Row, Tabs, Button } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CWM_ASN_STATUS } from 'common/constants';
import { hideDock, changeDockTab, getSo, getSoUuid, getShipmtOrderNo } from 'common/reducers/cwmShippingOrder';
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
    dock: state.cwmShippingOrder.dock,
    visible: state.cwmShippingOrder.dock.visible,
    tabKey: state.cwmShippingOrder.dock.tabKey,
    order: state.cwmShippingOrder.dock.order,
    defaultWhse: state.cwmContext.defaultWhse,
    uuid: state.cwmShippingOrder.dock.order.uuid,
  }),
  { hideDock, changeDockTab, getSo, getSoUuid, getShipmtOrderNo, loadOrderDetail }
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
  }
  state = {
    soHead: {},
    soBody: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.order.so_no !== this.props.order.so_no || this.state.soBody.length === 0) {
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
      case CWM_ASN_STATUS.PENDING.value: return 'default';
      case CWM_ASN_STATUS.processing: return 'processing';
      case CWM_ASN_STATUS.finished: return 'success';
      default: return 'default';
    }
  }
  renderStatusMsg(status) {
    switch (status) {
      case CWM_ASN_STATUS.created: return this.msg('created');
      case CWM_ASN_STATUS.processing: return this.msg('processing');
      case CWM_ASN_STATUS.finished: return this.msg('finished');
      default: return '';
    }
  }
  renderTabs() {
    const { soHead, soBody } = this.state;
    const { order } = this.props;
    const tabs = [];
    tabs.push(
      <TabPane tab={this.msg('shippingOrder')} key="order">
        <OrderPane soHead={soHead} soBody={soBody} />
      </TabPane>);
    if (soHead.bonded) {
      tabs.push(
        <TabPane tab={this.msg('tabFTZ')} key="ftz">
          <FTZPane soNo={order.so_no} />
        </TabPane>);
    }
    tabs.push(
      <TabPane tab={this.msg('shippingOutbound')} key="outbound">
        <OutboundPane outboundNo={order.outboundNo} />
      </TabPane>);
    return (
      <Tabs defaultActiveKey="order" onChange={this.handleTabChange}>
        {tabs}
      </Tabs>
    );
  }

  renderExtra() {
    const { defaultWhse } = this.props;
    const { soHead } = this.state;
    console.log(soHead);
    return (
      <Row>
        <Col span="6">
          <InfoItem label="仓库" addonBefore={<Icon type="tag-o" />} field={defaultWhse.name} />
        </Col>
        <Col span="6">
          <InfoItem label="货主" field={soHead.owner_name} />
        </Col>
        <Col span="6">
          <InfoItem label="客户订单号/海关备案号" addonBefore={<Icon type="tag-o" />} field={soHead.cust_order_no} />
        </Col>
        <Col span="4">
          <InfoItem label="预计到货日期" addonBefore={<Icon type="calendar" />} field={moment(soHead.expect_shipping_date).format('YYYY/MM/DD')} />
        </Col>
        <Col span="2">
          <InfoItem label="货物属性" field={soHead.bonded ? '保税' : '非保税'} />
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
  render() {
    const { visible } = this.props;
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hideDock}
        title={this.renderTitle()}
        status={this.renderStatus(0)} statusText={this.renderStatusMsg(0)}
        extra={this.renderExtra()}
        // alert={this.renderAlert()}
      >
        {this.renderTabs()}
      </DockPanel>
    );
  }
}
