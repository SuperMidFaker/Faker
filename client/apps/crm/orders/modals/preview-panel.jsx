import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Badge } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CRM_ORDER_MODE, CRM_ORDER_STATUS } from 'common/constants';
import { hidePreviewer, changePreviewerTab, loadClearanceDetail, loadTransportDetail } from 'common/reducers/crmOrders';

import ShipmentSchedule from './shipmentSchedule';
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
    delgNo: state.crmOrders.previewer.order.ccb_delg_no,
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
    delgNo: PropTypes.string.isRequired,
    shipmtNos: PropTypes.string.isRequired,
    loadClearanceDetail: PropTypes.func.isRequired,
    loadTransportDetail: PropTypes.func.isRequired,
  }
  componentWillMount() {
    const { tenantId, delgNo, shipmtNos } = this.props;
    if (delgNo) {
      this.props.loadClearanceDetail({ tenantId, delgNo });
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
    const { tenantId, delgNo, shipmtNos } = nextProps;
    if (delgNo && delgNo !== this.props.delgNo) {
      this.props.loadClearanceDetail({ tenantId, delgNo });
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

  renderTabs(mode) {
    let tabKey;
    if (this.props.tabKey) {
      tabKey = this.props.tabKey;
    } else if (mode === CRM_ORDER_MODE.clearance || mode === CRM_ORDER_MODE.clearanceAndTransport) {
      tabKey = 'clearance';
    } else {
      tabKey = 'transport';
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
          <TabPane tab={this.msg('logs')} key="logs">
            <LogPane />
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
          <TabPane tab={this.msg('logs')} key="logs">
            <LogPane />
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
          <TabPane tab={this.msg('logs')} key="logs">
            <LogPane />
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
      <div className={`dock-panel preview-panel ${visible ? 'inside' : ''}`} id="preview-panel">
        <div className="panel-content">
          <div className="header">
            <span className="title">{order.shipmt_order_no}</span>
            <Badge status={this.transformBadgeColor(order.order_status)} text={this.getTrackStatusMsg(order.order_status)} />
            <div className="pull-right">
              {closer}
            </div>
          </div>
          <div className="body">
            <ShipmentSchedule />
            {this.renderTabs(order.shipmt_order_mode)}
          </div>
        </div>
      </div>
    );
  }
}
