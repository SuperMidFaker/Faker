import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Icon, Tabs } from 'antd';
import { Logixon } from 'client/components/FontIcon';
import PickupDeliverForm from './form/pickupDeliverForm';
import PODForm from './form/podForm';
import DamageForm from './form/damageForm';
import RejectionForm from './form/rejectionForm';
import ComplaintForm from './form/complaintForm';
import ClaimForm from './form/claimForm';
import TransitForm from './form/transitForm';
import { SHIPMENT_POD_STATUS, SHIPMENT_VEHICLE_CONNECT, SHIPMENT_TRACK_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    disp: state.shipment.previewer.dispatch,
    shipmt: state.shipment.previewer.shipmt,
  })
)
export default class ActivityOperation extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    disp: PropTypes.object.isRequired,
    shipmt: PropTypes.object.isRequired,
    sourceType: PropTypes.string.isRequired,
  }
  state = {
    activeKey: 'transit',
  }
  componentDidMount() {
    this.initializeActiveKey(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.initializeActiveKey(nextProps);
  }
  initializeActiveKey = (props) => {
    const { disp, sourceType } = props;
    let { activeKey } = this.state;
    if (sourceType === 'sr') {
      if (disp.status === SHIPMENT_TRACK_STATUS.unaccepted || disp.status === SHIPMENT_TRACK_STATUS.accepted) {
        activeKey = 'transit';
      } else if (disp.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (disp.sp_tenant_id === -1) {
          activeKey = 'pickup';
        } else if (disp.sp_tenant_id === 0) {
            // 已分配给车队
          if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            // 线下司机
            activeKey = 'pickup';
          } else {
            // 司机更新
            activeKey = 'transit';
          }
        } else {
          // 催促提货
          activeKey = 'transit';
        }
      } else if (disp.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (disp.sp_tenant_id === -1) {
          // 上报位置
          activeKey = 'deliver';
        } else if (disp.sp_tenant_id === 0) {
          if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            // 上报位置
            activeKey = 'deliver';
          } else {
            // 司机更新
            activeKey = 'transit';
          }
        } else {
          // 承运商更新
          activeKey = 'transit';
        }
      } else if (disp.status >= SHIPMENT_TRACK_STATUS.delivered) {
        if (disp.pod_type !== 'none' && (disp.pod_status === SHIPMENT_POD_STATUS.unsubmit || !disp.pod_status)) {
          if (disp.sp_tenant_id === -1) {
            activeKey = 'pod';
          } else if (disp.sp_tenant_id === 0) {
            if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              activeKey = 'pod';
            } else {
              // 司机上传 催促回单
              activeKey = 'transit';
            }
          } else {
            // 承运商上传 催促回单
            activeKey = 'transit';
          }
        } else if (disp.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          // 重新上传
          activeKey = 'pod';
        } else {
          activeKey = 'transit';
        }
      }
    } else if (sourceType === 'sp') {
      activeKey = 'transit';
    }
    this.setState({ activeKey });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (activeKey) => {
    this.setState({ activeKey });
  }

  renderTabs() {
    const { disp, shipmt } = this.props;
    const { activeKey } = this.state;
    const originlocation = {
      province: shipmt.consignee_province,
      city: shipmt.consignee_city,
      district: shipmt.consignee_district,
      address: shipmt.consignee_addr,
    };
    const destLocation = {
      province: shipmt.consignee_province,
      city: shipmt.consignee_city,
      district: shipmt.consignee_district,
      address: shipmt.consignee_addr,
    };
    const isOfflineSP = (disp.sp_tenant_id === -1) || (disp.sp_tenant_id === 0 && disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected);
    const pickupEnabled = disp.status === SHIPMENT_TRACK_STATUS.dispatched && isOfflineSP;
    const transitEnabled = disp.status === SHIPMENT_TRACK_STATUS.intransit;
    const deliverEnabled = disp.status === SHIPMENT_TRACK_STATUS.intransit && isOfflineSP;
    const delivered = disp.status > SHIPMENT_TRACK_STATUS.intransit;
    const tabs = [
      <TabPane tab={<span><Logixon type="upload" />提货</span>} key="pickup" disabled={!pickupEnabled}>
        <PickupDeliverForm type="pickup" estDate={shipmt.pickup_est_date} location={originlocation} />
      </TabPane>,
      <TabPane tab={<span><Logixon type="tracking" />在途更新</span>} key="transit" disabled={!transitEnabled}><TransitForm /></TabPane>,
      <TabPane tab={<span><Logixon type="download" />送货</span>} key="deliver" disabled={!deliverEnabled}>
        <PickupDeliverForm type="deliver" estDate={shipmt.deliver_est_date} location={destLocation} />
      </TabPane>,
      <TabPane tab={<span><Logixon type="pod-accept-o" />回单</span>} key="pod" disabled={!delivered}><PODForm /></TabPane>,
      <TabPane tab={<span><Icon type="exclamation-circle-o" />货差</span>} key="damage" disabled={!delivered}><DamageForm /></TabPane>,
      <TabPane tab={<span><Logixon type="pod-reject-o" />拒收</span>} key="reject" disabled={!delivered}><RejectionForm /></TabPane>,
      <TabPane tab={<span><Logixon type="complain" />投诉</span>} key="complaint"><ComplaintForm /></TabPane>,
      <TabPane tab={<span><Logixon type="refund" />索赔</span>} key="claim"><ClaimForm /></TabPane>,
    ];
    return (
      <Tabs activeKey={activeKey} onChange={this.handleTabChange}>
        {tabs}
      </Tabs>
    );
  }
  render() {
    // const { disp, shipmt, sourceType, tenantId } = this.props;
    /*
    let tabs = [
    ];
    if (sourceType === 'sr') {
      if (disp.status === SHIPMENT_TRACK_STATUS.dispatched) {
        const location = {
          province: shipmt.consigner_province,
          city: shipmt.consigner_city,
          district: shipmt.consigner_district,
          address: shipmt.consigner_addr,
        };
        if (disp.sp_tenant_id === -1) {
          tabs = [
            <TabPane tab={<span><Icon type="environment-o" />提货</span>} key="pickup" >
              <PickupDeliverPane type="pickup" estDate={shipmt.pickup_est_date} location={location} />
            </TabPane>,
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        } else if (disp.sp_tenant_id === 0) {
            // 已分配给车队
          if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            // 线下司机
            tabs = [
              <TabPane tab={<span><Icon type="environment-o" />提货</span>} key="pickup" >
                <PickupDeliverPane type="pickup" estDate={shipmt.pickup_est_date} location={location} />
              </TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          } else {
            // 司机更新
            tabs = [
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          }
        } else {
          // 催促提货
          tabs = [
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        }
      } else if (disp.status === SHIPMENT_TRACK_STATUS.intransit) {
        const location = {
          province: shipmt.consignee_province,
          city: shipmt.consignee_city,
          district: shipmt.consignee_district,
          address: shipmt.consignee_addr,
        };
        if (disp.sp_tenant_id === -1) {
          // 上报位置
          tabs = [
            <TabPane tab={<span><Icon type="environment-o" />送货</span>} key="deliver" >
              <PickupDeliverPane type="deliver" estDate={shipmt.deliver_est_date} location={location} />
            </TabPane>,
            <TabPane tab={<span><Icon type="environment-o" />追踪</span>} key="location" ><RouteForm /></TabPane>,
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        } else if (disp.sp_tenant_id === 0) {
          if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            // 上报位置
            tabs = [
              <TabPane tab={<span><Icon type="environment-o" />送货</span>} key="deliver" >
                <PickupDeliverPane type="deliver" estDate={shipmt.deliver_est_date} location={location} />
              </TabPane>,
              <TabPane tab={<span><Icon type="environment-o" />追踪</span>} key="location" ><RouteForm /></TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          } else {
            // 司机更新
            tabs = [
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          }
        } else {
          // 承运商更新
          tabs = [
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        }
      } else if (disp.status >= SHIPMENT_TRACK_STATUS.delivered) {
        if (disp.pod_type !== 'none' && (disp.pod_status === SHIPMENT_POD_STATUS.unsubmit || !disp.pod_status)) {
          if (disp.sp_tenant_id === -1 || tenantId === shipmt.tenant_id) {
            tabs = [
              <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          } else if (disp.sp_tenant_id === 0) {
            if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              tabs = [
                <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>,
                <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
              ];
            } else {
              // 司机上传 催促回单
              tabs = [
                <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
              ];
            }
          } else {
            // 承运商上传 催促回单
            tabs = [
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          }
        } else if (disp.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          // 重新上传
          tabs = [
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>,
          ];
        } else {
          tabs = [
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        }
      }
    }
    */
    return (
      <Card bodyStyle={{ padding: 8 }} noHovering>
        {this.renderTabs()}
      </Card>
    );
  }
}
