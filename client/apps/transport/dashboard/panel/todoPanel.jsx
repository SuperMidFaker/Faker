import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Badge, Tabs, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import TodoAcceptPane from './pane/todoAcceptPane';
import TodoTrackingPane from './pane/todoTrackingPane';
import TodoPodPane from './pane/todoPodPane';
import MyShipmentsSelect from '../../common/myShipmentsSelect';
import { countTotal } from 'common/reducers/shipment';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    todos: state.shipment.statistics.todos,
    loginId: state.account.loginId,
  }),
  { countTotal })
export default class TodoPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    todos: PropTypes.object.isRequired,
    countTotal: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      viewStatus: 'all',
      tabKey: 'todoAccept',
    };
  }
  componentDidMount() {
    this.handleCount();
  }
  msg = formatMsg(this.props.intl)
  handleShipmentViewSelect = (value) => {
    this.setState({ viewStatus: value.viewStatus }, () => {
      this.handleCount();
    });
  }
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleCount = () => {
    const { tenantId, loginId } = this.props;
    const acceptFilters = {
      viewStatus: this.state.viewStatus,
      loginId,
      status: 'all',
    };
    const trackingFilters = [
      { name: 'viewStatus', value: this.state.viewStatus },
      { name: 'loginId', value: loginId },
      { name: 'type', value: 'dispatchedOrIntransit' },
    ];
    const podFilters = [
      { name: 'viewStatus', value: this.state.viewStatus },
      { name: 'loginId', value: loginId },
      { name: 'type', value: 'todoAll' },
    ];
    this.props.countTotal({ tenantId, acceptFilters, trackingFilters, podFilters });
  }
  render() {
    const { todos } = this.props;
    const { viewStatus, tabKey } = this.state;
    const filter = { viewStatus, tabKey };
    const extra = (
      <div>
        <MyShipmentsSelect onChange={this.handleShipmentViewSelect} onInitialize={this.handleShipmentViewSelect} />
      </div>);
    return (
      <Card title={<span>待办事项</span>} bodyStyle={{ minHeight: 475, padding: '10px 0 0' }} extra={extra}>
        <Tabs tabPosition="left" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab={<span><Icon type="inbox" /> {this.msg('todoAccept')}<Badge count={todos.acceptanceTotal} style={{ marginLeft: 8 }} /></span>} key="todoAccept" >
            <TodoAcceptPane filter={filter} />
          </TabPane>
          <TabPane tab={<span><Icon type="compass" /> {this.msg('todoTrack')}<Badge count={todos.trackingTotal} style={{ marginLeft: 8 }} /></span>} key="todoTrack">
            <TodoTrackingPane filter={filter} />
          </TabPane>
          <TabPane tab={<span><Icon type="select" /> {this.msg('todoPod')}<Badge count={todos.podTotal} style={{ marginLeft: 8 }} /></span>} key="todoPod">
            <TodoPodPane filter={filter} />
          </TabPane>
          <TabPane tab={<span><Icon type="pay-circle-o" /> {this.msg('todoBilling')}<Badge count={todos.billingList.totalCount} style={{ marginLeft: 8 }} /></span>} key="todoBilling" />
        </Tabs>

      </Card>);
  }
}
