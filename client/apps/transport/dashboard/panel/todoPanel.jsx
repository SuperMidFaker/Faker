import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Badge, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadShipmentStatistics } from 'common/reducers/shipment';
import connectFetch from 'client/common/decorators/connect-fetch';
import moment from 'moment';
import TodoAcceptPane from './pane/todoAcceptPane';
import MyShipmentsSelect from '../../common/myShipmentsSelect';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

function fetchData({ state, dispatch, cookie }) {
  const firstDay = new Date();
  firstDay.setDate(1);
  const startDate = `${moment(state.shipment.statistics.startDate || firstDay).format('YYYY-MM-DD')} 00:00:00`;
  const endDate = `${moment(state.shipment.statistics.endDate || new Date()).format('YYYY-MM-DD')} 23:59:59`;
  const promises = [dispatch(loadShipmentStatistics(cookie, state.account.tenantId, startDate, endDate))];
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.shipment.statistics,
  }),
  { loadShipmentStatistics })
export default class TodoPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    children: PropTypes.object,
  }

  msg = formatMsg(this.props.intl)
  handleShipmentViewSelect = () => {

  }
  render() {
    const extra = (<MyShipmentsSelect onChange={this.handleShipmentViewSelect} />);
    return (
      <Card title={<span>待办事项</span>} bodyStyle={{ minHeight: 360 }} extra={extra}>
        <Tabs tabPosition="left" defaultActiveKey="todoAccept">
          <TabPane tab={<span>{this.msg('todoAccept')}<Badge count={5} style={{ marginLeft: 8 }} /></span>} key="todoAccept" >
            <TodoAcceptPane />
          </TabPane>
          <TabPane tab={<span>{this.msg('todoTrack')}<Badge count={0} style={{ marginLeft: 8 }} /></span>} key="todoTrack" />
          <TabPane tab={<span>{this.msg('todoPod')}<Badge count={999} style={{ marginLeft: 8 }} /></span>} key="todoPod" />
          <TabPane tab={<span>{this.msg('todoBilling')}<Badge count={2} style={{ marginLeft: 8 }} /></span>} key="todoBilling" />
        </Tabs>
      </Card>);
  }
}
