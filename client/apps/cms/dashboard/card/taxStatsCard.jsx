import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker, Select } from 'antd';
import moment from 'moment';
import currencyFormatter from 'currency-formatter';
import { format } from 'client/common/i18n/helpers';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadCmsTaxStats } from 'common/reducers/cmsDashboard';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { RangePicker } = DatePicker;
const { Option } = Select;

function fetchData({ state, dispatch }) {
  const firstDay = new Date();
  firstDay.setDate(1);
  const startDate = `${moment(state.cmsDashboard.taxStats.startDate || firstDay).format('YYYY-MM-DD')} 00:00:00`;
  const endDate = `${moment(state.cmsDashboard.taxStats.endDate || new Date()).format('YYYY-MM-DD')} 23:59:59`;
  const clientView = JSON.stringify({ tenantIds: [], partnerIds: [] });
  return dispatch(loadCmsTaxStats({
    tenantId: state.account.tenantId, startDate, endDate, clientView,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    taxStats: state.cmsDashboard.taxStats,
    clients: state.partner.partners,
  }),
  { loadCmsTaxStats }
)

export default class TaxStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    taxStats: PropTypes.object.isRequired,
  }
  onDateChange = (value, dateString) => {
    const { clientView } = this.props.taxStats;
    this.props.loadCmsTaxStats({
      tenantId: this.props.tenantId, startDate: `${dateString[0]} 00:00:00`, endDate: `${dateString[1]} 23:59:59`, clientView,
    });
  }
  handleClientSelectChange = (value) => {
    const { startDate, endDate } = this.props.taxStats;
    const clientView = { tenantIds: [], partnerIds: [] };
    if (value !== -1) {
      const client = this.props.clients.find(clt => clt.partner_id === value);
      if (client.partner_id !== null) {
        clientView.partnerIds.push(client.partner_id);
      } else {
        clientView.tenantIds.push(client.tid);
      }
    }
    this.props.loadCmsTaxStats({
      tenantId: this.props.tenantId, startDate, endDate, clientView: JSON.stringify(clientView),
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const {
      startDate, endDate, totalPaid, dutyTax, vatTax, comsuTax, totalWithdrawn,
    } = this.props.taxStats;
    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    const datePicker = (
      <div>
        <Select
          showSearch
          optionFilterProp="children"
          style={{ width: 160 }}
          onChange={this.handleClientSelectChange}
          defaultValue={-1}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: 360 }}
        >
          {clients.map(data => (<Option
            key={data.partner_id}
            value={data.partner_id}
            search={`${data.partner_code}${data.name}`}
          >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
          </Option>))}
        </Select>
        <RangePicker
          style={{ width: 256, marginLeft: 8 }}
          value={[moment(startDate), moment(endDate)]}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
          onChange={this.onDateChange}
          allowClear={false}
        />
      </div>);
    return (
      <Card title={this.msg('taxStats')} extra={datePicker}>
        <ul className="statistics-columns">
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('totalPaid')}</h4>
              <div className="data">
                <div className="data-num text-error">{currencyFormatter.format(totalPaid, { code: 'CNY' })}</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('duty')}</h4>
              <div className="data">
                <div className="data-num text-emphasis">{currencyFormatter.format(dutyTax, { code: 'CNY' })}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('VAT')}</h4>
              <div className="data">
                <div className="data-num text-emphasis">{currencyFormatter.format(vatTax, { code: 'CNY' })}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('comsuTax')}</h4>
              <div className="data">
                <div className="data-num text-emphasis">{currencyFormatter.format(comsuTax, { code: 'CNY' })}</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('totalWithdrawn')}</h4>
              <div className="data">
                <div className="data-num text-success">{currencyFormatter.format(totalWithdrawn, { code: 'CNY' })}</div>
              </div>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
