import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import { Link } from 'react-router';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import { Card, Col, DatePicker, Layout, Row } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { loadShipmentStatistics, loadShipmtDetail, loadFormRequire } from 'common/reducers/shipment';
import messages from '../message.i18n';
import '../index.less';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch, cookie }) {
  const startDate = `${moment(state.shipment.statistics.startDate || new Date()).format('YYYY-MM-DD')} 00:00:00`;
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
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  logsLocation = (type) => {
    const { startDate, endDate } = this.props.statistics;
    return `/transport/dashboard/operationLogs?type=${type}&startDate=${startDate}&endDate=${endDate}`;
  }
  render() {
    const { startDate, endDate, todos, total, overtime, intransit, exception, arrival } = this.props.statistics;
    const datePicker = (
      <div>
        <RangePicker style={{ width: 200 }} value={[moment(startDate), moment(endDate)]}
          onChange={this.onDateChange}
        />
      </div>);
    const imgStyle = { width: 60, height: 60 };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <span>{this.msg('dashboard')}</span>
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24} md={16}>
              <Card title="活动简报" extra={datePicker}>
                <ul className="statistics-columns">
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('total')}</h6>
                      <Link to={this.logsLocation('total')}><p className="data-num lg">{total}</p></Link>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('overtime')}</h6>
                      <Link to={this.logsLocation('overtime')}><p className="data-num lg">{overtime}</p></Link>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('intransit')}</h6>
                      <Link to={this.logsLocation('intransit')}><p className="data-num lg">{intransit}</p></Link>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('exception')}</h6>
                      <Link to={this.logsLocation('exception')}><p className="data-num lg">{exception}</p></Link>
                    </div>
                  </li>
                  <li className="col-4">
                    <div className="statistics-cell">
                      <h6>{this.msg('arrival')}</h6>
                      <Link to={this.logsLocation('arrival')}><p className="data-num lg">{arrival}</p></Link>
                    </div>
                  </li>
                </ul>
              </Card>
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
            </Col>
            <Col sm={24} md={8}>
              <Card title="公告" bodyStyle={{ height: 100 }} />
              <Card title="动态" bodyStyle={{ height: 200 }} />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
