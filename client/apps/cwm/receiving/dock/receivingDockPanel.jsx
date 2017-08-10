import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Col, Row, Tabs, Button, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CWM_ASN_STATUS } from 'common/constants';
import { hideDock, changeDockTab, loadAsn, getInstanceUuid, getAsnUuid, getShipmtOrderNo } from 'common/reducers/cwmReceive';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import ASNPane from './tabpane/asnPane';
import FTZPane from './tabpane/ftzPane';
import InboundPane from './tabpane/inboundPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    dock: state.cwmReceive.dock,
    visible: state.cwmReceive.dock.visible,
    tabKey: state.cwmReceive.dock.tabKey,
    asn: state.cwmReceive.dock.asn,
    uuid: state.cwmReceive.dock.asn.uuid,
  }),
  { hideDock, changeDockTab, loadAsn, getInstanceUuid, loadOrderDetail, getAsnUuid, getShipmtOrderNo }
)
export default class ReceivingDockPanel extends React.Component {
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
    asnHead: {},
    asnBody: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.asn.asn_no && !this.props.visible && nextProps.visible) {
      this.props.getAsnUuid(nextProps.asn.asn_no);
      this.props.loadAsn(nextProps.asn.asn_no).then(
        (result) => {
          if (!result.error) {
            this.setState({
              asnHead: result.data.asnHead ? result.data.asnHead : {},
              asnBody: result.data.asnBody,
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
      case CWM_ASN_STATUS.PENDING.value: return CWM_ASN_STATUS.PENDING.badge;
      case CWM_ASN_STATUS.INBOUND.value: return CWM_ASN_STATUS.INBOUND.badge;
      case CWM_ASN_STATUS.EXCEPTION.value: return CWM_ASN_STATUS.EXCEPTION.badge;
      case CWM_ASN_STATUS.COMPLETED.value: return CWM_ASN_STATUS.COMPLETED.badge;
      default: return 'default';
    }
  }
  renderStatusMsg(status) {
    switch (status) {
      case CWM_ASN_STATUS.PENDING.value: return CWM_ASN_STATUS.PENDING.text;
      case CWM_ASN_STATUS.INBOUND.value: return CWM_ASN_STATUS.INBOUND.text;
      case CWM_ASN_STATUS.EXCEPTION.value: return CWM_ASN_STATUS.EXCEPTION.text;
      case CWM_ASN_STATUS.COMPLETED.value: return CWM_ASN_STATUS.COMPLETED.text;
      default: return '';
    }
  }
  renderTitle = () => {
    const { uuid, asn } = this.props;
    const button = uuid ? <Button shape="circle" icon="home" onClick={this.goHomeDock} /> : '';
    return (
      <span>{button}<span>{asn.asn_no}</span></span>
    );
  }
  renderTabs() {
    const { asn } = this.props;
    const { asnHead, asnBody } = this.state;
    const tabs = [
      <TabPane tab={this.msg('tabASN')} key="asn">
        <ASNPane asnHead={asnHead} asnBody={asnBody} />
      </TabPane>,
    ];
    if (asnHead.bonded) {
      tabs.push(
        <TabPane tab={this.msg('tabFTZ')} key="ftz">
          <FTZPane asnNo={asn.asn_no} />
        </TabPane>);
    }
    if (asnHead.status > CWM_ASN_STATUS.PENDING.value) {
      tabs.push(
        <TabPane tab={this.msg('tabInbound')} key="inbound">
          <InboundPane asnNo={asn.asn_no} />
        </TabPane>);
    }
    return (
      <Tabs defaultActiveKey="asn" onChange={this.handleTabChange}>
        { tabs }
      </Tabs>
    );
  }

  renderExtra() {
    const { asnHead } = this.state;
    return (
      <Row>
        <Col span="6">
          <InfoItem label="仓库" addonBefore={<Icon type="tag-o" />} field={asnHead.whse_name} />
        </Col>
        <Col span="6">
          <InfoItem label="货主" field={asnHead.owner_name} />
        </Col>
        <Col span="6">
          <InfoItem label="采购订单号/海关备案号" addonBefore={<Icon type="tag-o" />} field={asnHead.po_no} />
        </Col>
        <Col span="2">
          <InfoItem label="货物属性" field={asnHead.bonded ? '保税' : '非保税'} />
        </Col>
        <Col span="4">
          <InfoItem label="创建时间" addonBefore={<Icon type="calendar" />} field={moment(asnHead.created_date).format('YYYY.MM.DD HH:mm')} />
        </Col>
      </Row>);
  }

  render() {
    const { visible } = this.props;
    const { asnHead } = this.state;
    const menu = (
      <Menu>
        <Menu.Item key="1">1st menu item</Menu.Item>
        <Menu.Item key="2">2nd menu item</Menu.Item>
      </Menu>
    );
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hideDock}
        title={this.renderTitle()}
        status={this.renderStatus(asnHead.status)} statusText={this.renderStatusMsg(asnHead.status)}
        overlay={menu}
        extra={this.renderExtra()}
        // alert={this.renderAlert()}
      >
        {this.renderTabs()}
      </DockPanel>
    );
  }
}
