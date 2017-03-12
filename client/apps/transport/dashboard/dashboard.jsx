import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import { Link } from 'react-router';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Breadcrumb, Button, Card, Col, Layout, Row } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { loadShipmentStatistics, loadShipmtDetail, loadFormRequire } from 'common/reducers/shipment';
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
  { loadShipmentStatistics, loadShipmtDetail })
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
    const { todos } = this.props.statistics;
    const imgStyle = { width: 60, height: 60 };
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
              <Card title="受理">
                <ul className="statistics-columns">
                  <li className="transport-dashboard">
                    <img style={imgStyle} role="presentation" src={`${__CDN__}/assets/img/spread.png`} />
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待接单</h6>
                      <Link to="/transport/shipment"><p className="data-num lg">{todos.unaccepted}</p></Link>
                    </div>
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待分配</h6>
                      <Link to="/transport/dispatch"><p className="data-num lg">{todos.undispatched}</p></Link>
                    </div>
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待发送</h6>
                      <Link to="/transport/dispatch"><p className="data-num lg">{todos.dispatched}</p></Link>
                    </div>
                  </li>
                </ul>
              </Card>
              <Card title="追踪">
                <ul className="statistics-columns">
                  <li className="transport-dashboard">
                    <img style={imgStyle} role="presentation" src={`${__CDN__}/assets/img/truck.png`} />
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待提货</h6>
                      <Link to="/transport/tracking/road/status/dispatched"><p className="data-num lg">{todos.undelivered}</p></Link>
                    </div>
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待上报位置</h6>
                      <Link to="/transport/tracking/road/status/intransit"><p className="data-num lg">{todos.unReportLocation}</p></Link>
                    </div>
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待交货</h6>
                      <Link to="/transport/tracking/road/status/intransit"><p className="data-num lg">{todos.intransit}</p></Link>
                    </div>
                  </li>
                </ul>
              </Card>
              <Card title="确认">
                <ul className="statistics-columns">
                  <li className="transport-dashboard">
                    <img style={imgStyle} role="presentation" src={`${__CDN__}/assets/img/ok.png`} />
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待上传回单</h6>
                      <Link to="/transport/tracking/road/pod/upload"><p className="data-num lg">{todos.delivered}</p></Link>
                    </div>
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>回单待审核</h6>
                      <Link to="/transport/tracking/road/pod/audit"><p className="data-num lg">{todos.podsubmit}</p></Link>
                    </div>
                  </li>
                  <li className="transport-dashboard">
                    <div className="statistics-cell">
                      <h6>待确认交货</h6>
                      <Link to="/transport/tracking/road/status/delivered"><p className="data-num lg">{todos.unconfirmed}</p></Link>
                    </div>
                  </li>
                </ul>
              </Card>
              <TodoPanel />
            </Col>
            <Col sm={24} md={6}>
              <Card title="实时动态" bodyStyle={{ height: 200 }} />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
