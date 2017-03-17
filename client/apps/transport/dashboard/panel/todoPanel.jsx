import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Badge, Radio, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { hidePreviewer } from 'common/reducers/shipment';
import TodoAcceptPane from './pane/todoAcceptPane';
import TodoTrackingPane from './pane/todoTrackingPane';
import TodoPodPane from './pane/todoPodPane';
import MyShipmentsSelect from '../../common/myShipmentsSelect';
import AccepterModal from '../../shipment/modals/accepter';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    todos: state.shipment.statistics.todos,
  }),
  { hidePreviewer })
export default class TodoPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
    todos: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      viewStatus: 'all',
      type: 'dispatchedOrIntransit',
      tabKey: 'todoTrack',
    };
    setTimeout(() => {
      this.setState({ tabKey: 'todoPod', type: 'todoAll' });
    }, 200);
    setTimeout(() => {
      this.setState({ tabKey: 'todoAccept', type: 'all' });
    }, 400);
  }

  msg = formatMsg(this.props.intl)
  handleShipmentViewSelect = (value) => {
    this.setState({ viewStatus: value.viewStatus });
  }
  handleTodoFilter = (e) => {
    this.setState({ type: e.target.value });
    this.props.hidePreviewer();
  }
  handleTabChange = (tabKey) => {
    let type = '';
    if (tabKey === 'todoAccept') {
      type = 'all';
    } else if (tabKey === 'todoTrack') {
      type = 'dispatchedOrIntransit';
    } else if (tabKey === 'todoPod') {
      type = 'todoAll';
    }
    this.setState({ tabKey, type });
  }
  handleTableReload = () => {
    const { type } = this.state;
    this.setState({ type: '' });
    setTimeout(() => {
      this.setState({ type });
    }, 200);
  }
  render() {
    const { todos } = this.props;
    const { viewStatus, type, tabKey } = this.state;
    const filter = { viewStatus, type, tabKey };
    const extra = (
      <div>
        <MyShipmentsSelect onChange={this.handleShipmentViewSelect} />
      </div>);
    let radioButton = null;
    if (tabKey === 'todoAccept') {
      radioButton = (
        <RadioGroup onChange={this.handleTodoFilter} value={this.state.type} style={{ marginLeft: 15 }}>
          <RadioButton value="all">{this.msg('all')}</RadioButton>
          <RadioButton value="toAccept">{this.msg('toAccept')}</RadioButton>
          <RadioButton value="toDispatch">{this.msg('toDispatch')}</RadioButton>
          <RadioButton value="prompt">{this.msg('prompt')}</RadioButton>
        </RadioGroup>);
    } else if (tabKey === 'todoTrack') {
      radioButton = (
        <RadioGroup onChange={this.handleTodoFilter} value={this.state.type} style={{ marginLeft: 15 }}>
          <RadioButton value="dispatchedOrIntransit">{this.msg('all')}</RadioButton>
          <RadioButton value="toPickup">{this.msg('dispatchedShipmt')}</RadioButton>
          <RadioButton value="toLocate">{this.msg('toLocateShipmt')}</RadioButton>
          <RadioButton value="toDeliver">{this.msg('toDeliverShipmt')}</RadioButton>
        </RadioGroup>);
    } else if (tabKey === 'todoPod') {
      radioButton = (
        <RadioGroup onChange={this.handleTodoFilter} value={this.state.type} style={{ marginLeft: 15 }}>
          <RadioButton value="todoAll">{this.msg('all')}</RadioButton>
          <RadioButton value="toUploadPod">{this.msg('toUploadPod')}</RadioButton>
          <RadioButton value="toAuditPod">{this.msg('toAuditPod')}</RadioButton>
          <RadioButton value="toConfirm">{this.msg('toConfirm')}</RadioButton>
        </RadioGroup>);
    }
    return (
      <Card title={<span>待办事项{radioButton}</span>} bodyStyle={{ minHeight: 360, padding: '10px 0 0' }} extra={extra}>
        <Tabs tabPosition="left" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab={<span>{this.msg('todoAccept')}<Badge count={todos.acceptanceList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoAccept" >
            <TodoAcceptPane filter={filter} />
          </TabPane>
          <TabPane tab={<span>{this.msg('todoTrack')}<Badge count={todos.trackingList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoTrack">
            <TodoTrackingPane filter={filter} />
          </TabPane>
          <TabPane tab={<span>{this.msg('todoPod')}<Badge count={todos.podList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoPod">
            <TodoPodPane filter={filter} />
          </TabPane>
          <TabPane tab={<span>{this.msg('todoBilling')}<Badge count={todos.billingList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoBilling" />
        </Tabs>
        <AccepterModal reload={this.handleTableReload} clearSelection={() => {}} />
      </Card>);
  }
}
