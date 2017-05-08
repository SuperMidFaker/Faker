import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Tabs, Button } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import DetailPane from './tabpanes/detail-pane';
import ActivityLoggerPane from './tabpanes/ActivityLoggerPane';
import ChargePane from './tabpanes/chargePane';
import PodPane from './tabpanes/podPane';
import TrackingPane from './tabpanes/trackingPane';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES } from 'common/constants';
import { hidePreviewer, sendTrackingDetailSMSMessage, changePreviewerTab, loadShipmtDetail, loadForm } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import messages from '../message.i18n';
import ShipmentActions from './shipmentActions';
import ShareShipmentModal from './share-shipment';
import ExceptionPane from './tabpanes/exceptionPane';
import ChangeActDateModal from '../../tracking/land/modals/changeActDateModal';
import ChangeDeliverPrmDateModal from '../../tracking/land/modals/changeDeliverPrmDateModal';
import ShipmentAdvanceModal from '../../tracking/land/modals/shipment-advance-modal';
import CreateSpecialCharge from '../../tracking/land/modals/create-specialCharge';
import VehicleModal from '../../tracking/land/modals/vehicle-updater';
import { showDock } from 'common/reducers/crmOrders';

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
  { hidePreviewer, sendTrackingDetailSMSMessage, changePreviewerTab, loadShipmtDetail, loadForm, showDock }
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
    loadForm: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      shareShipmentModalVisible: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { previewer: { visible, loaded, params: { shipmtNo, tenantId, sourceType }, tabKey } } = nextProps;
    if (!loaded && visible) {
      this.props.loadShipmtDetail(shipmtNo, tenantId, sourceType, tabKey);
      this.props.loadForm(null, {
        tenantId,
        shipmtNo,
      });
    }
  }
  componentWillUnmount() {
    this.props.hidePreviewer();
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
  goBack = () => {
    this.props.hidePreviewer();
    this.props.showDock();
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
  renderExtra() {
    const { shipmt } = this.props;
    return (<Row>
      <Col span="6">
        <InfoItem label="托运方"
          field={shipmt.customer_name}
        />
      </Col>
      <Col span="6">
        <InfoItem label="承运商"
          field={shipmt.lsp_name}
        />
      </Col>
      <Col span="6">
        <InfoItem label="客户单号"
          field={shipmt.ref_external_no}
        />
      </Col>
      <Col span="6">
        <InfoItem label="创建时间"
          field={moment(shipmt.created_date).format('YYYY.MM.DD')}
        />
      </Col>
    </Row>);
  }
  renderTitle = () => {
    const { shipmtNo } = this.props;
    return (
      <span><Button shape="circle" icon="left" onClick={this.goBack} /><span>{shipmtNo}</span></span>
    );
  }
  render() {
    const { shipmt, visible, shipmtNo, dispatch, effective, stage, previewer: { params: { sourceType } } } = this.props;
    return (
      shipmtNo ?
        <DockPanel size="large" visible={visible} onClose={this.handleClose}
          title={this.renderTitle()}
          status={this.transformBadgeColor(dispatch.status)} statusText={this.msg(getTrackStatusMsg(dispatch.status, effective))}
          extra={this.renderExtra()}
          alert={this.viewStages.indexOf(this.props.stage) === -1 && <ShipmentActions stage={stage} sourceType={sourceType} onShowShareShipmentModal={this.handleShowShareShipmentModal} />}
        >
          {this.renderTabs(dispatch.status, stage, sourceType)}
          <ShareShipmentModal visible={this.state.shareShipmentModalVisible} shipmt={shipmt} />
          <ChangeActDateModal />
          <ChangeDeliverPrmDateModal />
          <ShipmentAdvanceModal />
          <CreateSpecialCharge />
          <VehicleModal onOK={() => {}} />
        </DockPanel>
      : null
    );
  }
}
