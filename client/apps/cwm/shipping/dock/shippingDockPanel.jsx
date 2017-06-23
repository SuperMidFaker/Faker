import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Col, Row, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CWM_ASN_STATUS } from 'common/constants';
import { hideDock, changeDockTab } from 'common/reducers/cwmShippingOrder';
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

  }),
  { hideDock, changeDockTab }
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
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.props.changeDockTab(tabKey);
  }
  handleClose = () => {
    this.props.hideDock();
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
    // const { asn } = this.props;
    return (
      <Tabs defaultActiveKey="asn" onChange={this.handleTabChange}>
        <TabPane tab={this.msg('tabOrder')} key="order">
          <OrderPane />
        </TabPane>
        <TabPane tab={this.msg('tabFTZ')} key="ftz">
          <FTZPane />
        </TabPane>
        <TabPane tab={this.msg('tabOutbound')} key="outbound">
          <OutboundPane />
        </TabPane>
      </Tabs>
    );
  }

  renderExtra() {
    // const { asn } = this.props;
    return (
      <Row>
        <Col span="6">
          <InfoItem label="仓库" addonBefore={<Icon type="tag-o" />} field={''} />
        </Col>
        <Col span="6">
          <InfoItem label="货主" field={'asn.owner_name'} />
        </Col>
        <Col span="6">
          <InfoItem label="采购订单号/海关备案号" addonBefore={<Icon type="tag-o" />} field={''} />
        </Col>
        <Col span="4">
          <InfoItem label="预计到货日期" addonBefore={<Icon type="calendar" />} field={''} />
        </Col>
        <Col span="2">
          <InfoItem label="货物属性" field={''} />
        </Col>
      </Row>);
  }

  render() {
    const { visible } = this.props;
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hideDock}
        title={'asn.asn_no'}
        status={this.renderStatus(0)} statusText={this.renderStatusMsg(0)}
        extra={this.renderExtra()}
        // alert={this.renderAlert()}
      >
        {this.renderTabs()}
      </DockPanel>
    );
  }
}
