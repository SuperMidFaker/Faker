import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import { Card, DatePicker, Col, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/nav-link';
import { loadShipmentStatistics } from 'common/reducers/shipment';
import './index.less';
import messages from './message.i18n';
const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch, cookie }) {
  const { startDate, endDate } = state.shipment.statistics;
  return dispatch(loadShipmentStatistics(cookie, state.account.tenantId, startDate, endDate));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.shipment.statistics,
  }),
  { loadShipmentStatistics })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null,
  }));
})

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
    const { count, startDate, endDate } = this.props.statistics;
    const datePicker = (
      <div>
        <RangePicker style={{ width: 200 }} defaultValue={[startDate, endDate]} onChange={this.onDateChange} />
      </div>);
    const iconStyle = {
      fontSize: '32px',
      fontWeight: 'bolder',
      borderRadius: '50%',
      color: '#fff',
      padding: '18px 24px',
      width: '70px',
      height: '70px',
    };
    const right = {
      display: 'inline-block',
      paddingLeft: '10px',
    };
    const rightTop = {
      height: '80%',
      fontSize: '32px',
      color: '#000',
      lineHeight: 1,
    };
    const rightBottom = {
      height: '20%',
      fontSize: '14px',
      color: '#999999',
      marginTop: '5px',
    };

    const columns = [{
      title: '操作',
      dataIndex: 'name',
      width: '20%',
      render(text) {
        return text;
      },
    }, {
      title: '详情',
      dataIndex: 'operation',
      width: '80%',
      render: (value) => {
        return value;
      },
    }];
    const data = [{
      key: '1',
      name: '待接单',
      operation: '',
    }, {
      key: '2',
      name: '待调度',
      operation: '',
    }, {
      key: '3',
      name: '待更新提货',
      operation: '',
    }, {
      key: '4',
      name: '待更新位置',
      operation: '',
    }, {
      key: '5',
      name: '待更新交货',
      operation: '',
    }, {
      key: '6',
      name: '待上传回单',
      operation: '',
    }, {
      key: '7',
      name: '待审核回单',
      operation: '',
    }];

    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.msg('transportDashboard')}</span>
        </header>
        <div className="main-content" key="main">
          <div className="page-body" style={{ padding: 16 }} delay={500}>
            <Card title="活动简报" extra={datePicker}>
              <QueueAnim type={['right', 'left']} delay={500} className="ant-row-flex ant-row-flex-space-around ant-row-flex-middle">
                <Col span={4} className="stats-data" key="a">
                    <i className="zmdi zmdi-file-plus" style={{ backgroundColor: 'rgba(250, 196, 80, 1)', ...iconStyle }} />
                    <div style={right}>
                      <div style={rightTop}>
                        <NavLink to={this.logsLocation('accepted')}>
                        {count[0]}
                        </NavLink>
                      </div>
                      <div style={rightBottom}>{this.msg('accepted')}</div>
                    </div>
                </Col>
                <Col span={4} className="stats-data" key="b">
                    <i className="zmdi zmdi-assignment" style={{ backgroundColor: 'rgba(1, 179, 202, 1)', ...iconStyle }} />
                    <div style={right}>
                      <div style={rightTop}>
                        <NavLink to={this.logsLocation('sent')}>
                        {count[1]}
                        </NavLink>
                      </div>
                      <div style={rightBottom}>{this.msg('sent')}</div>
                    </div>
                </Col>
                <Col span={4} className="stats-data" key="c">
                    <i className="zmdi zmdi-truck" style={{ backgroundColor: 'rgba(0, 151, 218, 1)', ...iconStyle }} />
                    <div style={right}>
                      <div style={rightTop}>
                        <NavLink to={this.logsLocation('pickedup')}>
                        {count[2]}
                        </NavLink>
                      </div>
                      <div style={rightBottom}>{this.msg('pickedup')}</div>
                    </div>
                </Col>
                <Col span={4} className="stats-data" key="d">
                    <i className="zmdi zmdi-flag" style={{ backgroundColor: 'rgba(88, 45, 170, 1)', ...iconStyle }} />
                    <div style={right}>
                      <div style={rightTop}>
                        <NavLink to={this.logsLocation('delivered')}>
                        {count[3]}
                        </NavLink>
                      </div>
                      <div style={rightBottom}>{this.msg('delivered')}</div>
                    </div>
                </Col>
                <Col span={4} className="stats-data" key="e">
                    <i className="zmdi zmdi-assignment-check" style={{ backgroundColor: 'rgba(95, 188, 41, 1)', ...iconStyle }} />
                    <div style={right}>
                      <div style={rightTop}>
                        <NavLink to={this.logsLocation('completed')}>
                        {count[4]}
                        </NavLink>
                      </div>
                      <div style={rightBottom}>{this.msg('completed')}</div>
                    </div>
                </Col>
                </QueueAnim>
            </Card>
            <Card title="待处理" bodyStyle={{ marginTop: 16 }}>
              <Table size="small" columns={columns} dataSource={data} pagination={false} />
            </Card>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
