import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Badge } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DetailPane from './tabpanes/detail-pane';
import LogPane from './tabpanes/logPane';
import ChargePane from './tabpanes/chargePane';
import PodPane from './tabpanes/podPane';
import TrackingPane from './tabpanes/trackingPane';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES } from 'common/constants';
import { hidePreviewer, sendTrackingDetailSMSMessage } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import Footer from './preview-panel-footer';
import ShareShipmentModal from './share-shipment';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function getTrackStatusMsg(status, eff) {
  let msg = 'trackDraft';
  if (eff === SHIPMENT_EFFECTIVES.cancelled) {
    msg = 'trackNullified';
  } else if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
    msg = 'trackUnaccept';
  } else if (status === SHIPMENT_TRACK_STATUS.accepted) {
    msg = 'trackAccepted';
  } else if (status === SHIPMENT_TRACK_STATUS.dispatched) {
    msg = 'trackDispatched';
  } else if (status === SHIPMENT_TRACK_STATUS.intransit) {
    msg = 'trackIntransit';
  } else if (status === SHIPMENT_TRACK_STATUS.delivered) {
    msg = 'trackDelivered';
  } else if (status > SHIPMENT_TRACK_STATUS.delivered) {
    msg = 'trackPod';
  }
  return msg;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.shipment.previewer.visible,
    tabKey: state.shipment.previewer.tabKey,
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    status: state.shipment.previewer.shipmt.status,
    effective: state.shipment.previewer.shipmt.effective,
    shipmt: state.shipment.previewer.shipmt,
    previewer: state.shipment.previewer,
  }),
  { hidePreviewer, sendTrackingDetailSMSMessage }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    shipmtNo: PropTypes.string,
    status: PropTypes.number,
    effective: PropTypes.number,
    hidePreviewer: PropTypes.func.isRequired,
    sendTrackingDetailSMSMessage: PropTypes.func.isRequired,
    shipmt: PropTypes.object.isRequired,
    previewer: PropTypes.object.isRequired,
    stage: PropTypes.oneOf(['acceptance', 'dispatch', 'tracking', 'pod', 'exception', 'billing', 'dashboard']),
  }
  constructor(props) {
    super(props);
    this.state = {
      tabKey: props.tabKey || 'detail',
      shareShipmentModalVisible: false,
    };
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
    if (nextProps.tabKey !== this.state.tabKey) {
      this.setState({ tabKey: nextProps.tabKey || 'detail' });
    }
  }
  componentWillUnmount() {
    window.$(document).unbind('click');
  }
  viewStages = ['billing', 'dashboard'];
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleClose = () => {
    this.props.hidePreviewer();
  }
  handleShowShareShipmentModal = () => {
    this.setState({
      shareShipmentModalVisible: true,
    });
    setTimeout(() => {
      this.setState({ shareShipmentModalVisible: false });
    }, 500);
  }
  transformBadgeColor(status) {
    switch (status) {
      case SHIPMENT_TRACK_STATUS.unaccepted: return 'default';
      case SHIPMENT_TRACK_STATUS.accepted: return 'default';
      case SHIPMENT_TRACK_STATUS.dispatched: return 'warning';
      case SHIPMENT_TRACK_STATUS.intransit: return 'processing';
      case SHIPMENT_TRACK_STATUS.delivered: return 'success';
      case SHIPMENT_TRACK_STATUS.podsubmit: return 'success';
      default: return 'success';
    }
  }
  renderTabs(status) {
    if (status >= SHIPMENT_TRACK_STATUS.podsubmit) {
      return (
        <Tabs type="card" activeKey={this.state.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
          <TabPane tab={this.msg('trackPod')} key="pod">
            <PodPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtLogs')} key="logs">
            <LogPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtTracking')} key="tracking">
            <TrackingPane />
          </TabPane>
        </Tabs>
      );
    } else {
      return (
        <Tabs type="card" activeKey={this.state.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
          <TabPane tab={this.msg('shipmtLogs')} key="logs">
            <LogPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtTracking')} key="tracking">
            <TrackingPane />
          </TabPane>
        </Tabs>
      );
    }
  }
  render() {
    const { shipmt, visible, shipmtNo, status, effective, stage } = this.props;
    const closer = (
      <button
        onClick={this.handleClose}
        aria-label="Close"
        className="ant-modal-close"
      >
        <span className="ant-modal-close-x" />
      </button>);
    return (
      shipmtNo ?
        <div className={`preview-panel ${visible ? 'inside' : ''}`} id="preview-panel">
          <div className="panel-content">
            <div className="header">
              <span className="title">{shipmtNo}</span>
              <Badge status={this.transformBadgeColor(shipmt.status)} text={this.msg(getTrackStatusMsg(status, effective))} />
              <div className="pull-right">
                {this.viewStages.indexOf(this.props.stage) === -1 ? (<Footer stage={stage} onShowShareShipmentModal={this.handleShowShareShipmentModal} />) : ''}
                {closer}
              </div>
            </div>
            <div className="body">
              {this.renderTabs(shipmt.status)}
            </div>
          </div>
          <ShareShipmentModal visible={this.state.shareShipmentModalVisible} shipmt={shipmt} />
        </div>
      : null
    );
  }
}
