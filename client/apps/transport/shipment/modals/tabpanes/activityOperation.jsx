import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Icon, Tabs } from 'antd';
import CreateExceptionPane from './CreateExceptionPane';
import CreatePointPane from './CreatePointPane';
import CreateLogPane from './CreateLogPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    status: state.shipment.previewer.dispatch.status,
  })
)
export default class ActivityOperation extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    stage: PropTypes.oneOf(['acceptance', 'dispatch', 'tracking', 'pod', 'exception', 'billing', 'dashboard']),
    status: PropTypes.number.isRequired,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { stage } = this.props;
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
      tabs = (
        <Tabs defaultActiveKey="log">
          <TabPane tab={<span><Icon type="message" />备注</span>} key="log" ><CreateLogPane /></TabPane>
          <TabPane tab={<span><Icon type="exception" />异常</span>} key="exception"><CreateExceptionPane /></TabPane>
        </Tabs>
      );
    } else if (stage === 'exception') {
      tabs = (
        <Tabs defaultActiveKey="log">
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
