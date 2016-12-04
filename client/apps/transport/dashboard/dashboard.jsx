import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import { Link } from 'react-router';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import { Card, DatePicker, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/nav-link';
import { loadShipmentStatistics, loadShipmtDetail, loadFormRequire } from 'common/reducers/shipment';
import messages from '../message.i18n';
import '../index.less';
import PreviewPanel from '../shipment/modals/preview-panel';

const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch, cookie }) {
  const { startDate, endDate } = state.shipment.statistics;
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
  renderTodos = (arr, stage) => {
    let sourceType = 'sr';
    if (stage === 'acceptance' || stage === 'dispatch') sourceType = 'sp';
    let addonafter = '';
    if (arr.length === 0) return '';
    if (arr.length > 30) addonafter = ` 等共 ${arr.length} 单`;
    const newArr = arr.slice(0, 30);
    return newArr.map((item, index) => {
      return (
        <span>
          <a onClick={() => this.props.loadShipmtDetail(item.shipmt_no, this.props.tenantId, sourceType, 'detail', item)}
            title={item.shipmt_no}
          >
            {item.ref_external_no || item.shipmt_no}
          </a>
          {index !== newArr.length - 1 ? '、' : addonafter}
        </span>
      );
    });
  }
  render() {
    const { count, startDate, endDate, todos } = this.props.statistics;
    const datePicker = (
      <div>
        <RangePicker style={{ width: 200 }} defaultValue={[moment(startDate), moment(endDate)]}
          onChange={this.onDateChange}
        />
      </div>);

    const columns = [{
      title: '操作',
      dataIndex: 'name',
      key: 'name',
      width: '8%',
      render(text) {
        return text;
      },
    }, {
      title: '详情',
      dataIndex: 'operation',
      key: 'operation',
      width: '92%',
      render: (value) => {
        return value;
      },
    }];
    const data = [{
      key: '1',
      name: <Link to="/transport/shipment">待接单</Link>,
      operation: this.renderTodos(todos.unaccepted, 'acceptance'),
    }, {
      key: '2',
      name: <Link to="/transport/dispatch">待调度</Link>,
      operation: this.renderTodos(todos.undispatched, 'dispatch'),
    }, {
      key: '3',
      name: <Link to="/transport/tracking/road/status/dispatched">待更新提货</Link>,
      operation: this.renderTodos(todos.undelivered, 'tracking'),
    }, {
      key: '4',
      name: '待更新位置',
      operation: '',
    }, {
      key: '5',
      name: <Link to="/transport/tracking/road/status/intransit">待更新送货</Link>,
      operation: this.renderTodos(todos.intransit, 'tracking'),
    }, {
      key: '6',
      name: <Link to="/transport/tracking/road/pod/upload">待上传回单</Link>,
      operation: this.renderTodos(todos.delivered, 'pod'),
    }, {
      key: '7',
      name: <Link to="/transport/tracking/road/pod/audit">待审核回单</Link>,
      operation: this.renderTodos(todos.podsubmit, 'pod'),
    }];

    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.msg('transportDashboard')}</span>
        </header>
        <div className="main-content" key="main">
          <div className="page-body card-wrapper" delay={500}>
            <Card title="活动简报" extra={datePicker}>
              <ul className="statistics-columns">
                <li className="col-4">
                  <i className="zmdi zmdi-file-plus" style={{ backgroundColor: 'rgba(250, 196, 80, 1)' }} />
                  <div className="statistics-cell">
                    <h6>{this.msg('accepted')}</h6>
                    <p className="data-num">{count[0]}</p>
                    <NavLink to={this.logsLocation('accepted')}>查看</NavLink>
                  </div>
                </li>
                <li className="col-4">
                  <i className="zmdi zmdi-assignment" style={{ backgroundColor: 'rgba(1, 179, 202, 1)' }} />
                  <div className="statistics-cell">
                    <h6>{this.msg('sent')}</h6>
                    <p className="data-num">{count[1]}</p>
                    <NavLink to={this.logsLocation('sent')}>查看</NavLink>
                  </div>
                </li>
                <li className="col-4">
                  <i className="zmdi zmdi-truck" style={{ backgroundColor: 'rgba(0, 151, 218, 1)' }} />
                  <div className="statistics-cell">
                    <h6>{this.msg('pickedup')}</h6>
                    <p className="data-num">{count[2]}</p>
                    <NavLink to={this.logsLocation('pickedup')}>查看</NavLink>
                  </div>
                </li>
                <li className="col-4">
                  <i className="zmdi zmdi-flag" style={{ backgroundColor: 'rgba(88, 45, 170, 1)' }} />
                  <div className="statistics-cell">
                    <h6>{this.msg('delivered')}</h6>
                    <p className="data-num">{count[3]}</p>
                    <NavLink to={this.logsLocation('delivered')}>查看</NavLink>
                  </div>
                </li>
                <li className="col-4">
                  <i className="zmdi zmdi-assignment-check" style={{ backgroundColor: 'rgba(95, 188, 41, 1)' }} />
                  <div className="statistics-cell">
                    <h6>{this.msg('completed')}</h6>
                    <p className="data-num">{count[4]}</p>
                    <NavLink to={this.logsLocation('completed')}>查看</NavLink>
                  </div>
                </li>
              </ul>
            </Card>
            <Card title="待处理" bodyStyle={{ padding: 0 }}>
              <Table size="small" columns={columns} dataSource={data} pagination={false} />
            </Card>
          </div>
        </div>
        <PreviewPanel stage="dashboard" />
      </QueueAnim>
    );
  }
}
