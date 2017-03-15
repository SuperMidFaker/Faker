import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Badge, Radio, Tabs, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadShipmtDetail } from 'common/reducers/shipment';
import TodoAcceptPane from './pane/todoAcceptPane';
import TodoTrackingPane from './pane/todoTrackingPane';
import TodoPodPane from './pane/todoPodPane';
import MyShipmentsSelect from '../../common/myShipmentsSelect';
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
  { loadShipmtDetail })
export default class TodoPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    todos: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    const startDate = new Date();
    const endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    this.state = {
      pickupEstDate: [startDate, endDate],
      viewStatus: 'all',
      day: 'today',
      type: 'all',
      tabKey: 'todoAccept',
    };
  }

  msg = formatMsg(this.props.intl)
  handleShipmentViewSelect = (value) => {
    this.setState({ viewStatus: value.viewStatus });
  }
  handleDayChange = (day) => {
    const { pickupEstDate: [startDate, endDate] } = this.state;
    const newDate = new Date();
    if (day === 'today') {
      startDate.setDate(newDate.getDate());
      endDate.setDate(newDate.getDate());
    } else if (day === 'tomorrow') {
      startDate.setDate(newDate.getDate() + 1);
      endDate.setDate(newDate.getDate() + 1);
    }
    this.setState({ pickupEstDate: [startDate, endDate], day });
  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr', 'detail', row).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleTodoFilter = (e) => {
    this.setState({ type: e.target.value });
  }
  handleTabChange = (tabKey) => {
    let type = '';
    if (tabKey === 'todoAccept') {
      type = 'all';
    } else if (tabKey === 'todoTrack') {
      type = 'dispatchedOrIntransit';
    }
    this.setState({ tabKey, type });
  }
  render() {
    const { todos } = this.props;
    const { day, pickupEstDate, viewStatus, type, tabKey } = this.state;
    const filter = { pickupEstDate: JSON.stringify(pickupEstDate), viewStatus, type };
    const extra = (
      <div>
        <a onClick={() => this.handleDayChange('today')} style={{ marginRight: 20 }} className={day === 'today' ? 'mdc-text-red' : 'mdc-text-grey'}>今天</a>
        <a onClick={() => this.handleDayChange('tomorrow')} style={{ marginRight: 20 }} className={day === 'tomorrow' ? 'mdc-text-red' : 'mdc-text-grey'}>明天</a>
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
          <RadioButton value="dispatched">{this.msg('dispatchedShipmt')}</RadioButton>
          <RadioButton value="toLocate">{this.msg('toLocateShipmt')}</RadioButton>
          <RadioButton value="intransit">{this.msg('toDeliverShipmt')}</RadioButton>
        </RadioGroup>);
    }
    return (
      <Card title={<span>待办事项{radioButton}</span>} bodyStyle={{ minHeight: 360, padding: '10px 0 0' }} extra={extra}>
        <Tabs tabPosition="left" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab={<Badge dot={todos.acceptanceList.totalCount > 0} style={{ marginLeft: 4 }} ><span>{this.msg('todoAccept')}</span></Badge>} key="todoAccept" >
            <TodoAcceptPane onShipmtPreview={this.handleShipmtPreview} filter={filter} />
          </TabPane>
          <TabPane tab={<Badge dot={todos.trackingList.totalCount > 0} style={{ marginLeft: 4 }} ><span>{this.msg('todoTrack')}</span></Badge>} key="todoTrack">
            <TodoTrackingPane onShipmtPreview={this.handleShipmtPreview} filter={filter} />
          </TabPane>
          <TabPane tab={<Badge dot={todos.podList.totalCount > 0} style={{ marginLeft: 4 }} ><span>{this.msg('todoPod')}</span></Badge>} key="todoPod">
            <TodoPodPane onShipmtPreview={this.handleShipmtPreview} filter={filter} />
          </TabPane>
          <TabPane tab={<Badge dot={todos.billingList.totalCount > 0} style={{ marginLeft: 4 }} ><span>{this.msg('todoBilling')}</span></Badge>} key="todoBilling" />
        </Tabs>
      </Card>);
  }
}
