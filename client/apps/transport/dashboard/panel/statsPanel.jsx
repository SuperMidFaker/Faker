import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, DatePicker, Tooltip, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadShipmentStatistics, loadFormRequire } from 'common/reducers/shipment';
import connectFetch from 'client/common/decorators/connect-fetch';
import moment from 'moment';
import { Link } from 'react-router';
import CustomerSelect from '../../common/customerSelect';
import { formatMsg } from '../message.i18n';

const RangePicker = DatePicker.RangePicker;

function fetchData({ state, dispatch, cookie }) {
  const firstDay = new Date();
  firstDay.setDate(1);
  const startDate = `${moment(state.shipment.statistics.startDate || firstDay).format('YYYY-MM-DD')} 00:00:00`;
  const endDate = `${moment(state.shipment.statistics.endDate || new Date()).format('YYYY-MM-DD')} 23:59:59`;
  const promises = [dispatch(loadShipmentStatistics(cookie, state.account.tenantId, startDate, endDate, -1, -1)),
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
    const { srPartnerId, srTenantId } = this.props.statistics;
    this.props.loadShipmentStatistics(null, this.props.tenantId, `${dateString[0]} 00:00:00`, `${dateString[1]} 23:59:59`, srPartnerId, srTenantId);
  }
  handleCustomerChange = (srPartnerId, srTenantId) => {
    const { startDate, endDate } = this.props.statistics;
    this.props.loadShipmentStatistics(null, this.props.tenantId, startDate, endDate, srPartnerId, srTenantId);
  }
  logsLocation = (type) => {
    const { startDate, endDate, srPartnerId, srTenantId } = this.props.statistics;
    return `/transport/dashboard/operationLogs?type=${type}&startDate=${startDate}&endDate=${endDate}&srPartnerId=${srPartnerId}&srTenantId=${srTenantId}`;
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { startDate, endDate, total, atOrigin, overtime, intransit, exception, arrival } = this.props.statistics;
    const datePicker = (
      <div>
        <CustomerSelect onChange={this.handleCustomerChange} />
        <RangePicker style={{ marginLeft: 8 }} value={[moment(startDate), moment(endDate)]}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
          onChange={this.onDateChange} allowClear={false}
        />
      </div>);
    return (
      <Card title={<span>运输统计<Tooltip title="以计划提货时间为基准，一段时间内运单的总票数=未起运的数量+在途的数量+已送达的数量">
        <Icon type="question-circle-o" style={{ marginLeft: 8 }} />
      </Tooltip></span>} extra={datePicker} noHovering bodyStyle={{ padding: 0 }}
      >
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <div className="label">{this.msg('total')}</div>
            <div className="data">
              <div className="data-num lg text-emphasis">
                <Link to={this.logsLocation('total')}>{total}</Link>
              </div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '50%' }} className="statistics-columns">
          <div className="statistics-cell">
            <div className="label">{this.msg('atOrigin')}</div>
            <div className="data">
              <div className="data-num lg text-warning">
                <Link to={this.logsLocation('atOrigin')} >{atOrigin}</Link>
              </div>
            </div>
          </div>
          <div className="statistics-cell">
            <div className="label">{this.msg('intransit')}</div>
            <div className="data">
              <div className="data-num lg text-info">
                <Link to={this.logsLocation('intransit')}>{intransit}</Link>
              </div>
            </div>
          </div>
          <div className="statistics-cell">
            <div className="label">{this.msg('arrival')}</div>
            <div className="data">
              <div className="data-num lg text-success">
                <Link to={this.logsLocation('arrival')}>{arrival}</Link>
              </div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '30%' }} className="statistics-columns">
          <div className="statistics-cell">
            <div className="label">{this.msg('overtime')}
              <Tooltip title="未能按承诺时效送达的运单数量及占总票数的比例">
                <Icon type="question-circle-o" />
              </Tooltip>
            </div>
            <div className="data">
              <div className="data-num lg text-error"><Link to={this.logsLocation('overtime')}>{overtime}</Link></div>
              <div className="data-extra">
                {total > 0 ? (overtime / total * 100).toFixed(2) : 0}%
                  <div>超时率</div>
              </div>
            </div>
          </div>
          <div className="statistics-cell">
            <div className="label">{this.msg('exception')}
              <Tooltip title="发生过异常事件的运单数量及占总票数的比例">
                <Icon type="question-circle-o" />
              </Tooltip>
            </div>
            <div className="data">
              <div className="data-num lg text-error"><Link to={this.logsLocation('exception')}>{exception}</Link></div>
              <div className="data-extra">
                {total > 0 ? (exception / total * 100).toFixed(2) : 0}%
                  <div>异常率</div>
              </div>
            </div>
          </div>
        </Card.Grid>
      </Card>);
  }
}
