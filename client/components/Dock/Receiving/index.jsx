import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Col, Row, Tabs, Button, Menu, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CWM_ASN_STATUS } from 'common/constants';
import { hideDock, changeDockTab, loadAsn, getInstanceUuid, getAsnUuid, getShipmtOrderNo, cancelAsn, closeAsn } from 'common/reducers/cwmReceive';
import { loadOrderDetail } from 'common/reducers/sofOrders';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import { createFilename } from 'client/util/dataTransform';
import { format } from 'client/common/i18n/helpers';
import ASNPane from './tabpane/asnPane';
import FTZPane from './tabpane/ftzPane';
import InboundPane from './tabpane/inboundPane';
import messages from './message.i18n';

const formatMsg = format(messages);
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    visible: state.cwmReceive.dock.visible,
    asn: state.cwmReceive.dock.asn,
    uuid: state.cwmReceive.dock.asn.uuid,
  }),
  {
    hideDock,
    changeDockTab,
    loadAsn,
    getInstanceUuid,
    loadOrderDetail,
    getAsnUuid,
    getShipmtOrderNo,
    cancelAsn,
    closeAsn,
  }
)
export default class ReceivingDock extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    hideDock: PropTypes.func.isRequired,
    changeDockTab: PropTypes.func.isRequired,
    cancelAsn: PropTypes.func.isRequired,
    closeAsn: PropTypes.func.isRequired,
  }
  state = {
    asnHead: {},
    asnBody: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.asn.asn_no && !this.props.visible && nextProps.visible) {
      this.props.getAsnUuid(nextProps.asn.asn_no);
      this.props.loadAsn(nextProps.asn.asn_no).then((result) => {
        if (!result.error) {
          this.setState({
            asnHead: result.data.asnHead ? result.data.asnHead : {},
            asnBody: result.data.asnBody,
          });
        }
      });
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
  handleComplete = (asnNo) => {
    this.props.closeAsn(asnNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleDeleteASN = (asnNo) => {
    this.props.cancelAsn(asnNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleMenuClick = (e) => {
    const { asnHead } = this.state;
    if (e.key === 'cancel') {
      Modal.confirm({
        title: '确认取消ASN?',
        content: '确认后此ASN的相关信息将会被删除',
        onOk: () => {
          this.handleDeleteASN(asnHead.asn_no);
        },
        onCancel() {},
      });
    } else if (e.key === 'close') {
      Modal.confirm({
        title: '确认关闭ASN?',
        content: '确认后此ASN将会被提前完成',
        onOk: () => {
          this.handleComplete(asnHead.asn_no);
        },
        onCancel() {},
      });
    }
  }
  goHomeDock = () => {
    const { uuid } = this.props;
    this.props.getShipmtOrderNo(uuid).then((result) => {
      this.props.loadOrderDetail(result.data.order_no);
      this.props.hideDock();
    });
  }
  handleExportExcel = () => {
    window.open(`${API_ROOTS.default}v1/cwm/receiving/exportAsnExcel/${createFilename('asn')}.xlsx?asnNo=${this.props.asn.asn_no}`);
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
      <TabPane tab={this.msg('masterInfo')} key="masterInfo">
        <ASNPane asnHead={asnHead} asnBody={asnBody} />
      </TabPane>,
    ];
    tabs.push(<TabPane tab={this.msg('asnDetails')} key="asnDetails">
      <FTZPane asnNo={asn.asn_no} />
    </TabPane>);
    if (asnHead.bonded) {
      tabs.push(<TabPane tab={this.msg('ftzReg')} key="ftzReg">
        <FTZPane asnNo={asn.asn_no} />
      </TabPane>);
    }
    if (asnHead.status > CWM_ASN_STATUS.PENDING.value) {
      tabs.push(<TabPane tab={this.msg('tabInbound')} key="inbound">
        <InboundPane asnNo={asn.asn_no} />
      </TabPane>);
    }
    return (
      <Tabs defaultActiveKey="masterInfo" onChange={this.handleTabChange}>
        { tabs }
      </Tabs>
    );
  }

  renderExtra() {
    const { asnHead } = this.state;
    return (
      <Row>
        <Col span="6">
          <InfoItem label="仓库" field={asnHead.whse_name} />
        </Col>
        <Col span="6">
          <InfoItem label="货主" field={asnHead.owner_name} />
        </Col>
        <Col span="6">
          <InfoItem label="订单参考号" field={asnHead.cust_order_no} />
        </Col>
        <Col span="2">
          <InfoItem label="货物属性" field={asnHead.bonded ? '保税' : '非保税'} />
        </Col>
        <Col span="4">
          <InfoItem label="创建时间" addonBefore={<Icon type="calendar" />} field={moment(asnHead.created_date).format('YYYY.MM.DD HH:mm')} />
        </Col>
      </Row>);
  }
  renderMenu() {
    const { asnHead } = this.state;
    const menuItems = [];
    if (asnHead.status === CWM_ASN_STATUS.PENDING.value
      || asnHead.status === CWM_ASN_STATUS.INBOUND.value) {
      menuItems.push(<Menu.Item key="cancel"><Icon type="delete" />取消ASN</Menu.Item>);
    } else if (asnHead.status === CWM_ASN_STATUS.DISCREPANT.value) {
      menuItems.push(<Menu.Item key="close"><Icon type="close-square" />关闭ASN</Menu.Item>);
    }
    menuItems.push(<Menu.Item key="export"><Icon type="export" /><span onClick={this.handleExportExcel}>导出ASN</span></Menu.Item>);
    return <Menu onClick={this.handleMenuClick}>{menuItems}</Menu>;
  }
  render() {
    const { visible } = this.props;
    const { asnHead } = this.state;
    let asnStatusBadage = 'default';
    let asnStatusMsg = '';
    Object.keys(CWM_ASN_STATUS).forEach((statusKey) => {
      if (CWM_ASN_STATUS[statusKey].value === asnHead.status) {
        asnStatusBadage = CWM_ASN_STATUS[statusKey].badge;
        asnStatusMsg = CWM_ASN_STATUS[statusKey].text;
      }
    });
    return (
      <DockPanel
        size="large"
        visible={visible}
        onClose={this.props.hideDock}
        label={this.msg('receivingNotice')}
        title={this.renderTitle()}
        status={asnStatusBadage}
        statusText={asnStatusMsg}
        overlay={this.renderMenu()}
        extra={this.renderExtra()}
        // alert={this.renderAlert()}
      >
        {this.renderTabs()}
      </DockPanel>
    );
  }
}
