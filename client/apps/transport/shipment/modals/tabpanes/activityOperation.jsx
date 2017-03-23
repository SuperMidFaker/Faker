import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Icon, Tabs } from 'antd';
import CreateExceptionPane from './CreateExceptionPane';
import CreatePointPane from './CreatePointPane';
import CreateLogPane from './CreateLogPane';
import SubmitPodPane from './submitPodPane';
import PickupDeliverPane from './pickupDeliverPane';
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
    stage: PropTypes.string.isRequired,
    disp: PropTypes.object.isRequired,
    shipmt: PropTypes.object.isRequired,
    sourceType: PropTypes.string.isRequired,
  }
  state = {
    activeKey: 'log',
  }
  componentWillReceiveProps(nextProps) {
    const { stage, disp, sourceType } = nextProps;
    let { activeKey } = this.state;
    if (sourceType === 'sr') {
      if (disp.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (disp.sp_tenant_id === -1) {
          activeKey = 'pickup';
        } else if (disp.sp_tenant_id === 0) {
            // 已分配给车队
          if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            // 线下司机
            activeKey = 'pickup';
          } else {
            // 司机更新
            activeKey = 'log';
          }
        } else {
          // 催促提货
          activeKey = 'log';
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
            activeKey = 'log';
          }
        } else {
          // 承运商更新
          activeKey = 'log';
        }
      } else if (disp.status >= SHIPMENT_TRACK_STATUS.delivered) {
        if (!disp.pod_status || disp.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
          if (disp.sp_tenant_id === -1) {
            activeKey = 'pod';
          } else if (disp.sp_tenant_id === 0) {
            if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              activeKey = 'pod';
            } else {
              // 司机上传 催促回单
              activeKey = 'log';
            }
          } else {
            // 承运商上传 催促回单
            activeKey = 'log';
          }
        } else if (disp.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          // 重新上传
          activeKey = 'pod';
        } else {
          activeKey = 'log';
        }
      }
    }
    if (stage === 'exception') {
      activeKey = 'exception';
    } else if (stage === 'dashboard') {
      activeKey = 'log';
    }
    this.setState({ activeKey });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleTabChange = (activeKey) => {
    this.setState({ activeKey });
  }
  render() {
    const { disp, shipmt, sourceType, stage, tenantId } = this.props;
    const { activeKey } = this.state;
    let tabs = [
      <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
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
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
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
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
              <TabPane tab={<span><Icon type="environment-o" />提货</span>} key="pickup" >
                <PickupDeliverPane type="pickup" estDate={shipmt.pickup_est_date} location={location} />
              </TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          } else {
            // 司机更新
            tabs = [
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          }
        } else {
          // 催促提货
          tabs = [
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
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
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
            <TabPane tab={<span><Icon type="environment-o" />送货</span>} key="deliver" >
              <PickupDeliverPane type="deliver" estDate={shipmt.deliver_est_date} location={location} />
            </TabPane>,
            <TabPane tab={<span><Icon type="environment-o" />追踪</span>} key="location" ><CreatePointPane /></TabPane>,
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        } else if (disp.sp_tenant_id === 0) {
          if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            // 上报位置
            tabs = [
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
              <TabPane tab={<span><Icon type="environment-o" />送货</span>} key="deliver" >
                <PickupDeliverPane type="deliver" estDate={shipmt.deliver_est_date} location={location} />
              </TabPane>,
              <TabPane tab={<span><Icon type="environment-o" />追踪</span>} key="location" ><CreatePointPane /></TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          } else {
            // 司机更新
            tabs = [
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          }
        } else {
          // 承运商更新
          tabs = [
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        }
      } else if (disp.status >= SHIPMENT_TRACK_STATUS.delivered) {
        if (!disp.pod_status || disp.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
          if (disp.sp_tenant_id === -1 || tenantId === shipmt.tenant_id) {
            tabs = [
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
              <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>,
            ];
          } else if (disp.sp_tenant_id === 0) {
            if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              tabs = [
                <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
                <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
                <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>,
              ];
            } else {
              // 司机上传 催促回单
              tabs = [
                <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
                <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
              ];
            }
          } else {
            // 承运商上传 催促回单
            tabs = [
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            ];
          }
        } else if (disp.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          // 重新上传
          tabs = [
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
            <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>,
          ];
        } else {
          tabs = [
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
          ];
        }
      }
    }
    if (stage === 'exception') {
      tabs = [
        <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
        <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>,
      ];
    } else if (stage === 'dashboard') {
      tabs = [
        <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>,
      ];
    }
    return (
      <div className="activity-wrapper">
        <Card bodyStyle={{ padding: 8 }}>
          <Tabs activeKey={activeKey} onChange={this.handleTabChange}>
            {tabs}
          </Tabs>
        </Card>
      </div>
    );
  }
}
