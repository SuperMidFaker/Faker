import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Icon, Tabs } from 'antd';
import CreateExceptionPane from './CreateExceptionPane';
import CreatePointPane from './CreatePointPane';
import CreateLogPane from './CreateLogPane';
import SubmitPodPane from './submitPodPane';
import { SHIPMENT_POD_STATUS, SHIPMENT_VEHICLE_CONNECT } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    disp: state.shipment.previewer.dispatch,
  })
)
export default class ActivityOperation extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    stage: PropTypes.oneOf(['acceptance', 'dispatch', 'tracking', 'pod', 'exception', 'billing', 'dashboard']),
    disp: PropTypes.object.isRequired,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { stage, disp } = this.props;
    let tabs = (
      <Tabs defaultActiveKey="log">
        <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
      </Tabs>
    );
    if (stage === 'acceptance') {
      tabs = (
        <Tabs defaultActiveKey="log">
          <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
        </Tabs>
      );
    } else if (stage === 'dispatch') {
      tabs = (
        <Tabs defaultActiveKey="log">
          <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
        </Tabs>
      );
    } else if (stage === 'tracking') {
      tabs = (
        <Tabs defaultActiveKey="log">
          <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
          <TabPane tab={<span><Icon type="environment-o" />追踪</span>} key="location" ><CreatePointPane /></TabPane>
          <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
        </Tabs>
      );
    } else if (stage === 'pod') {
      if (!disp.pod_status || disp.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
        if (disp.sp_tenant_id === -1) {
          tabs = (
            <Tabs defaultActiveKey="pod">
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
              <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>
            </Tabs>
          );
        } else if (disp.sp_tenant_id === 0) {
          if (disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            tabs = (
              <Tabs defaultActiveKey="pod">
                <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
                <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
                <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>
              </Tabs>
            );
          } else {
            // 司机上传 催促回单
            tabs = (
              <Tabs defaultActiveKey="log">
                <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
                <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
              </Tabs>
            );
          }
        } else {
          // 承运商上传 催促回单
          tabs = (
            <Tabs defaultActiveKey="log">
              <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
              <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
            </Tabs>
          );
        }
      } else if (disp.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
        // 重新上传
        tabs = (
          <Tabs defaultActiveKey="pod">
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
            <TabPane tab={<span><Icon type="tags" />回单</span>} key="pod"><SubmitPodPane /></TabPane>
          </Tabs>
        );
      } else {
        tabs = (
          <Tabs defaultActiveKey="log">
            <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
            <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
          </Tabs>
        );
      }
    } else if (stage === 'exception') {
      tabs = (
        <Tabs defaultActiveKey="exception">
          <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
          <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
        </Tabs>
      );
    }
    return (
      <div className="activity-wrapper">
        <Card bodyStyle={{ padding: 8 }}>
          {tabs}
        </Card>
      </div>
    );
  }
}
