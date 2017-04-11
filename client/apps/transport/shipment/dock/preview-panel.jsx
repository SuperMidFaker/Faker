import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge, Col, Row, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DetailPane from './tabpanes/detail-pane';
import ActivityLoggerPane from './tabpanes/ActivityLoggerPane';
import ChargePane from './tabpanes/chargePane';
import PodPane from './tabpanes/podPane';
import TrackingPane from './tabpanes/trackingPane';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES } from 'common/constants';
import { hidePreviewer, sendTrackingDetailSMSMessage, changePreviewerTab, loadShipmtDetail } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import InfoItem from 'client/components/InfoItem';
import messages from '../message.i18n';
import Footer from './preview-panel-footer';
import ShareShipmentModal from './share-shipment';
import ShipmentSchedule from './shipmentSchedule';
import ExceptionPane from './tabpanes/exceptionPane';
import ChangeActDateModal from '../../tracking/land/modals/changeActDateModal';
import ChangeDeliverPrmDateModal from '../../tracking/land/modals/changeDeliverPrmDateModal';
import ShipmentAdvanceModal from '../../tracking/land/modals/shipment-advance-modal';
import CreateSpecialCharge from '../../tracking/land/modals/create-specialCharge';
import VehicleModal from '../../tracking/land/modals/vehicle-updater';

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
    changeShipmentModalVisible: state.shipment.changeShipmentModal.visible,
    dealExcpModalVisible: state.trackingLandException.dealExcpModal.visible,
    specialChargeModalVisible: state.transportBilling.specialChargeModal.visible,
    advanceChargeModalvisible: state.transportBilling.advanceModal.visible,
    locModalVisible: state.trackingLandStatus.locModal.visible,
    dateModalVisible: state.trackingLandStatus.dateModal.visible,
    tabKey: state.shipment.previewer.tabKey,
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    dispatch: state.shipment.previewer.dispatch,
    effective: state.shipment.previewer.shipmt.effective,
    shipmt: state.shipment.previewer.shipmt,
    previewer: state.shipment.previewer,
  }),
  { hidePreviewer, sendTrackingDetailSMSMessage, changePreviewerTab, loadShipmtDetail }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    changeShipmentModalVisible: PropTypes.bool.isRequired,
    dealExcpModalVisible: PropTypes.bool.isRequired,
    specialChargeModalVisible: PropTypes.bool.isRequired,
    advanceChargeModalvisible: PropTypes.bool.isRequired,
    locModalVisible: PropTypes.bool.isRequired,
    dateModalVisible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    shipmtNo: PropTypes.string,
    dispatch: PropTypes.object,
    effective: PropTypes.number,
    hidePreviewer: PropTypes.func.isRequired,
    sendTrackingDetailSMSMessage: PropTypes.func.isRequired,
    changePreviewerTab: PropTypes.func.isRequired,
    shipmt: PropTypes.object.isRequired,
    previewer: PropTypes.object.isRequired,
    stage: PropTypes.oneOf(['acceptance', 'dispatch', 'tracking', 'pod', 'exception', 'billing', 'dashboard', 'todo']),
    loadShipmtDetail: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      shareShipmentModalVisible: false,
    };
  }
  componentDidMount() {
    /*
    window.$(document).click((event) => {
      const previewerClicked = window.$(event.target).closest('#preview-panel').length > 0;
      if (!this.props.specialChargeModalVisible && !this.props.dealExcpModalVisible &&
        && !this.props.advanceChargeModalvisible &&
        !this.props.changeShipmentModalVisible && !this.props.locModalVisible &&
        !this.props.dateModalVisible &&
        !previewerClicked) {
        this.handleClose();
      }
    });
    */
  }
  componentWillReceiveProps(nextProps) {
    const { previewer: { visible, loaded, params: { shipmtNo, tenantId, sourceType }, tabKey } } = nextProps;
    if (!loaded && visible) {
      this.props.loadShipmtDetail(shipmtNo, tenantId, sourceType, tabKey);
    }
  }
  componentWillUnmount() {
    /*
    window.$(document).unbind('click');
    */
  }
  viewStages = ['billing', 'dashboard'];
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (tabKey) => {
    this.props.changePreviewerTab(tabKey);
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
  renderTabs(status, stage, sourceType) {
    if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
      return (
        <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtActivity')} key="activity">
            <ActivityLoggerPane stage={stage} sourceType={sourceType} />
          </TabPane>
        </Tabs>
      );
    } else if (status === SHIPMENT_TRACK_STATUS.accepted) {
      return (
        <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtActivity')} key="activity">
            <ActivityLoggerPane stage={stage} sourceType={sourceType} />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
        </Tabs>
      );
    } else if (status === SHIPMENT_TRACK_STATUS.dispatched || status === SHIPMENT_TRACK_STATUS.intransit || status === SHIPMENT_TRACK_STATUS.delivered) {
      return (
        <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtActivity')} key="activity">
            <ActivityLoggerPane stage={stage} sourceType={sourceType} />
          </TabPane>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtTracking')} key="tracking">
            <TrackingPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
          <TabPane tab={this.msg('shipmtException')} key="exception">
            <ExceptionPane />
          </TabPane>
        </Tabs>
      );
    } else if (status >= SHIPMENT_TRACK_STATUS.podsubmit) {
      return (
        <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtActivity')} key="activity">
            <ActivityLoggerPane stage={stage} sourceType={sourceType} />
          </TabPane>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtTracking')} key="tracking">
            <TrackingPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
          <TabPane tab={this.msg('trackPod')} key="pod">
            <PodPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtException')} key="exception">
            <ExceptionPane />
          </TabPane>
        </Tabs>
      );
    } else {
      return (
        <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('shipmtActivity')} key="activity">
            <ActivityLoggerPane stage={stage} sourceType={sourceType} />
          </TabPane>
          <TabPane tab={this.msg('shipmtDetail')} key="detail">
            <DetailPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtTracking')} key="tracking">
            <TrackingPane />
          </TabPane>
          <TabPane tab={this.msg('shipmtCharge')} key="charge">
            <ChargePane />
          </TabPane>
          <TabPane tab={this.msg('shipmtException')} key="exception">
            <ExceptionPane />
          </TabPane>
        </Tabs>
      );
    }
  }
  render() {
    const { shipmt, visible, shipmtNo, dispatch, effective, stage, previewer: { params: { sourceType } } } = this.props;
    const closer = (
      <button onClick={this.handleClose} aria-label="Close" className="ant-modal-close">
        <span className="ant-modal-close-x" />
      </button>);
    return (
      shipmtNo ?
        <div className={`dock-panel dock-panel-lg ${visible ? 'inside' : ''}`} id="preview-panel">
          <div className="panel-content">
            <div className="header">
              <span className="title">{shipmtNo}</span>
              <Badge status={this.transformBadgeColor(dispatch.status)} text={this.msg(getTrackStatusMsg(dispatch.status, effective))} />
              <div className="toolbar-right">
                {this.viewStages.indexOf(this.props.stage) === -1 ? (<Footer stage={stage} sourceType={sourceType} onShowShareShipmentModal={this.handleShowShareShipmentModal} />) : ''}
                {closer}
              </div>
              <Row>
                <Col span="6">
                  <InfoItem labelCol={{ span: 3 }} label="托运方"
                    field={shipmt.customer_name} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="6">
                  <InfoItem labelCol={{ span: 3 }} label="承运商"
                    field={shipmt.lsp_name} fieldCol={{ span: 9 }}
                  />
                </Col>
                <Col span="12" style={{ paddingTop: 8 }}>
                  <ShipmentSchedule />
                </Col>
              </Row>
            </div>
            <div className="body with-header-summary">
              {this.renderTabs(dispatch.status, stage, sourceType)}
            </div>
          </div>
          <ShareShipmentModal visible={this.state.shareShipmentModalVisible} shipmt={shipmt} />
          <ChangeActDateModal />
          <ChangeDeliverPrmDateModal />
          <ShipmentAdvanceModal />
          <CreateSpecialCharge />
          <VehicleModal onOK={() => {}} />
        </div>
      : null
    );
  }
}
