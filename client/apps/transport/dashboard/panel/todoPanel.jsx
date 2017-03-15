import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Badge, Tabs, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadShipmtDetail } from 'common/reducers/shipment';
import TodoAcceptPane from './pane/todoAcceptPane';
import TodoTrackingPane from './pane/todoTrackingPane';
import TodoPodPane from './pane/todoPodPane';
import MyShipmentsSelect from '../../common/myShipmentsSelect';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    todos: state.shipment.statistics.todos,
  }),
  { loadShipmtDetail })
export default class TodoPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    todos: PropTypes.object.isRequired,
  }

  msg = formatMsg(this.props.intl)
  handleShipmentViewSelect = () => {

  }
  handleDayChange = () => {

  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr', 'detail', row).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { todos } = this.props;
    const extra = (<div><a onClick={() => this.handleDayChange('today')} style={{ marginRight: 20 }}>今天</a>
      <a onClick={() => this.handleDayChange('tomorrow')} style={{ marginRight: 20 }}>明天</a>
      <MyShipmentsSelect onChange={this.handleShipmentViewSelect} /></div>);
    return (
      <Card title={<span>待办事项</span>} bodyStyle={{ minHeight: 360, padding: '10px 0 0' }} extra={extra}>
        <Tabs tabPosition="left" defaultActiveKey="todoAccept">
          <TabPane tab={<span>{this.msg('todoAccept')}<Badge count={todos.acceptanceList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoAccept" >
            <TodoAcceptPane onShipmtPreview={this.handleShipmtPreview} />
          </TabPane>
          <TabPane tab={<span>{this.msg('todoTrack')}<Badge count={todos.acceptanceList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoTrack">
            <TodoTrackingPane onShipmtPreview={this.handleShipmtPreview} />
          </TabPane>
          <TabPane tab={<span>{this.msg('todoPod')}<Badge count={todos.acceptanceList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoPod">
            <TodoPodPane onShipmtPreview={this.handleShipmtPreview} />
          </TabPane>
          <TabPane tab={<span>{this.msg('todoBilling')}<Badge count={2} style={{ marginLeft: 8 }} /></span>} key="todoBilling" />
        </Tabs>
      </Card>);
  }
}
