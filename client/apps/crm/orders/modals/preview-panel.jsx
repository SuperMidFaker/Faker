import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge, Col, Row, Tabs } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { CRM_ORDER_MODE, CRM_ORDER_STATUS } from 'common/constants';
import { hidePreviewer, changePreviewerTab, loadClearanceDetail, loadTransportDetail } from 'common/reducers/crmOrders';
import InfoItem from 'client/components/InfoItem';
import ClearancePane from './tabpanes/clearancePane';
import TransportPane from './tabpanes/transportPane';
import LogPane from './tabpanes/logPane';
import ChargePane from './tabpanes/chargePane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.crmOrders.previewer.visible,
    tabKey: state.crmOrders.previewer.tabKey,
    order: state.crmOrders.previewer.order,
    previewer: state.crmOrders.previewer,
    delgNos: state.crmOrders.previewer.order.ccb_delg_no || '',
    shipmtNos: state.crmOrders.previewer.order.trs_shipmt_no || '',
  }),
  { hidePreviewer, changePreviewerTab, loadClearanceDetail, loadTransportDetail }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    hidePreviewer: PropTypes.func.isRequired,
    changePreviewerTab: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
    previewer: PropTypes.object.isRequired,
    delgNos: PropTypes.string.isRequired,
    shipmtNos: PropTypes.string.isRequired,
    loadClearanceDetail: PropTypes.func.isRequired,
    loadTransportDetail: PropTypes.func.isRequired,
  }
  componentWillMount() {
    const { tenantId, delgNos, shipmtNos } = this.props;
    if (delgNos) {
      this.props.loadClearanceDetail({ tenantId, delgNos });
    }
    if (shipmtNos) {
      this.props.loadTransportDetail({ tenantId, shipmtNos });
    }
  }
  componentDidMount() {
    window.$(document).click((event) => {
      const previewerClicked = window.$(event.target).closest('#preview-panel').length > 0;
      if (!previewerClicked) {
        this.handleClose();
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    const { tenantId, delgNos, shipmtNos } = nextProps;
    if (delgNos && delgNos !== this.props.delgNos) {
      this.props.loadClearanceDetail({ tenantId, delgNos });
    }
    if (shipmtNos && shipmtNos !== this.props.shipmtNos) {
      this.props.loadTransportDetail({ tenantId, shipmtNos });
    }
  }
  componentWillUnmount() {
    window.$(document).unbind('click');
  }
  getTrackStatusMsg(status) {
    switch (status) {
      case CRM_ORDER_STATUS.created: return this.msg('created');
      case CRM_ORDER_STATUS.clearancing: return this.msg('clearancing');
      case CRM_ORDER_STATUS.transporting: return this.msg('transporting');
      case CRM_ORDER_STATUS.finished: return this.msg('finished');
      default: return '';
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.props.changePreviewerTab(tabKey);
  }
  handleClose = () => {
    this.props.hidePreviewer();
  }
  transformBadgeColor(status) {
    switch (status) {
      case CRM_ORDER_STATUS.created: return 'default';
      case CRM_ORDER_STATUS.clearancing: return 'processing';
      case CRM_ORDER_STATUS.transporting: return 'processing';
      case CRM_ORDER_STATUS.finished: return 'success';
      default: return 'default';
    }
  }

  renderTabs(mode = '') {
    let tabKey;
    if (this.props.tabKey) {
      tabKey = this.props.tabKey;
    } else if (mode.indexOf(CRM_ORDER_MODE.clearance) >= 0) {
      tabKey = CRM_ORDER_MODE.clearance;
    } else {
      tabKey = CRM_ORDER_MODE.transport;
    }
    if (mode === CRM_ORDER_MODE.clearance) {
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('clearance')} key="clearance">
            <ClearancePane />
          </TabPane>
          <TabPane tab={this.msg('charge')} key="charge">
            <ChargePane />
          </TabPane>
        </Tabs>
      );
    } else if (mode === CRM_ORDER_MODE.transport) {
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('transport')} key="transport">
            <TransportPane />
          </TabPane>
          <TabPane tab={this.msg('charge')} key="charge">
            <ChargePane />
          </TabPane>
        </Tabs>
      );
    } else {
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('clearance')} key="clearance">
            <ClearancePane />
          </TabPane>
          <TabPane tab={this.msg('transport')} key="transport">
            <TransportPane />
          </TabPane>
          <TabPane tab={this.msg('charge')} key="charge">
            <ChargePane />
          </TabPane>
        </Tabs>
      );
    }
  }

  render() {
    const { order, visible } = this.props;

    const closer = (
      <button onClick={this.handleClose} aria-label="Close" className="ant-modal-close">
        <span className="ant-modal-close-x" />
      </button>);
    return (
      <div className={`dock-panel info-hub-panel ${visible ? 'inside' : ''}`} id="preview-panel">
        <div className="panel-content">
          <div className="header">
            <span className="title">{order.shipmt_order_no}</span>
            <Badge status={this.transformBadgeColor(order.order_status)} text={this.getTrackStatusMsg(order.order_status)} />
            <div className="pull-right">
              {closer}
            </div>
            <Row>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="客户"
                  field={order.customer_name} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="提运单号"
                  field={order.bl_wb_no} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="4">
                <InfoItem labelCol={{ span: 3 }} label="订单号"
                  field={order.order_no} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="4">
                <InfoItem labelCol={{ span: 3 }} label="发票号"
                  field={order.invoice_no} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="4">
                <InfoItem labelCol={{ span: 3 }} label="委托日期" fieldCol={{ span: 9 }}
                  field={moment(order.delg_time).format('YYYY.MM.DD')}
                />
              </Col>
            </Row>
          </div>
          <div className="body with-header-summary">
            <Row gutter={16}>
              <Col sm={24} md={12} lg={12}>
                {this.renderTabs(order.shipmt_order_mode)}
              </Col>
              <Col sm={24} md={12} lg={12}>
                <LogPane />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
