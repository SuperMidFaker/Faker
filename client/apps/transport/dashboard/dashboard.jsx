import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Breadcrumb, Button, Card, Col, Layout, Row } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { loadShipmentStatistics, loadFormRequire } from 'common/reducers/shipment';
import StatsPanel from './panel/statsPanel';
import TodoPanel from './panel/todoPanel';
import { formatMsg } from './message.i18n';

const { Header, Content } = Layout;

function fetchData({ state, dispatch, cookie }) {
  const firstDay = new Date();
  firstDay.setDate(1);
  const startDate = `${moment(state.shipment.statistics.startDate || firstDay).format('YYYY-MM-DD')} 00:00:00`;
  const endDate = `${moment(state.shipment.statistics.endDate || new Date()).format('YYYY-MM-DD')} 23:59:59`;
  const promises = [dispatch(loadShipmentStatistics(cookie, state.account.tenantId, startDate, endDate)),
    dispatch(loadFormRequire(cookie, state.account.tenantId))];
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
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'dashboard' })
export default class Dashboard extends React.Component {
  static propTypes = {
    children: PropTypes.object,
  }
  onDateChange = (value, dateString) => {
    this.props.loadShipmentStatistics(null, this.props.tenantId, `${dateString[0]} 00:00:00`, `${dateString[1]} 23:59:59`);
  }
  msg = formatMsg(this.props.intl)
  logsLocation = (type) => {
    const { startDate, endDate } = this.props.statistics;
    return `/transport/dashboard/operationLogs?type=${type}&startDate=${startDate}&endDate=${endDate}`;
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('dashboard')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" icon="global" />
          </div>
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24} md={18}>
              <StatsPanel />
              <TodoPanel />
            </Col>
            <Col sm={24} md={6}>
              <Card title="更多应用" bodyStyle={{ minHeight: 400 }} />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
