import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, DatePicker, Tooltip, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadShipmentStatistics, loadFormRequire } from 'common/reducers/shipment';
import connectFetch from 'client/common/decorators/connect-fetch';
import moment from 'moment';
import { Link } from 'react-router';
import { formatMsg } from '../message.i18n';

const RangePicker = DatePicker.RangePicker;

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
export default class StatsPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    children: PropTypes.object,
  }
  onDateChange = (value, dateString) => {
    this.props.loadShipmentStatistics(null, this.props.tenantId, `${dateString[0]} 00:00:00`, `${dateString[1]} 23:59:59`);
  }
  logsLocation = (type) => {
    const { startDate, endDate } = this.props.statistics;
    return `/transport/dashboard/operationLogs?type=${type}&startDate=${startDate}&endDate=${endDate}`;
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { startDate, endDate, total, overtime, intransit, exception, arrival } = this.props.statistics;
    const datePicker = (
      <div>
        <RangePicker style={{ width: 200 }} value={[moment(startDate), moment(endDate)]}
          onChange={this.onDateChange}
        />
      </div>);
    return (
      <Card title={<span>运输统计<Tooltip title="以预计提货时间为基准，一段时间内运单的总票数=未起运的数量+在途的数量+已送达的数量">
        <Icon type="question-circle-o" style={{ marginLeft: 8 }} />
      </Tooltip></span>} extra={datePicker}
      >
        <ul className="statistics-columns">
          <li className="statistics-col">
            <div className="statistics-cell">
              <h6>{this.msg('total')}</h6>
              <div className="data">
                <div className="data-num lg">
                  <Link to={this.logsLocation('total')}>{total}</Link>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="statistics-col">
            <div className="statistics-cell">
              <h6>{this.msg('atOrigin')}</h6>
              <div className="data">
                <div className="data-num lg">
                  <Link to={this.logsLocation('atOrigin')} >0</Link>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-col">
            <div className="statistics-cell">
              <h6>{this.msg('intransit')}</h6>
              <div className="data">
                <div className="data-num lg">
                  <Link to={this.logsLocation('intransit')}>{intransit}</Link>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-col">
            <div className="statistics-cell">
              <h6>{this.msg('arrival')}</h6>
              <div className="data">
                <div className="data-num lg">
                  <Link to={this.logsLocation('arrival')}>{arrival}</Link>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="statistics-col">
            <div className="statistics-cell">
              <h6>{this.msg('overtime')}
                <Tooltip title="未能按承诺时效送达的运单数量及占总票数的比例">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </h6>
              <div className="data">
                <div className="data-num lg"><Link to={this.logsLocation('overtime')}>{overtime}</Link></div>
                <div className="data-percent">
                  {overtime / total}
                  <div>超时率</div>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-col">
            <div className="statistics-cell">
              <h6>{this.msg('exception')}
                <Tooltip title="发生过异常事件的运单数量及占总票数的比例">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </h6>
              <div className="data">
                <div className="data-num lg"><Link to={this.logsLocation('exception')}>{exception}</Link></div>
                <div className="data-percent">
                  {exception / total}
                  <div>异常率</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </Card>);
  }
}
