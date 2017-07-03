import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker, Select } from 'antd';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadCmsStatistics } from 'common/reducers/cmsDashboard';
import { loadPartnersByTypes } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  const firstDay = new Date();
  firstDay.setDate(1);
  const startDate = `${moment(state.cmsDashboard.statistics.startDate || firstDay).format('YYYY-MM-DD')} 00:00:00`;
  const endDate = `${moment(state.cmsDashboard.statistics.endDate || new Date()).format('YYYY-MM-DD')} 23:59:59`;
  const promises = [dispatch(loadCmsStatistics({ tenantId: state.account.tenantId, startDate, endDate, cusPartnerId: -1, cusTenantId: -2 })),
    dispatch(loadPartnersByTypes(state.account.tenantId, [PARTNER_ROLES.CUS, PARTNER_ROLES.DCUS], PARTNER_BUSINESSE_TYPES.clearance))];
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.cmsDashboard.statistics,
    clients: state.partner.partners,
  }),
  { loadCmsStatistics }
)

export default class StatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    statistics: PropTypes.object.isRequired,
  }
  onDateChange = (value, dateString) => {
    const { cusPartnerId, cusTenantId } = this.props.statistics;
    this.props.loadCmsStatistics({ tenantId: this.props.tenantId, startDate: `${dateString[0]} 00:00:00`, endDate: `${dateString[1]} 23:59:59`, cusPartnerId, cusTenantId });
  }
  handleClientSelectChange = (value) => {
    const { startDate, endDate } = this.props.statistics;
    const client = this.props.clients.find(clt => clt.partner_id === value);
    const cusTenantId = client ? client.tid : -2;
    this.props.loadCmsStatistics({ tenantId: this.props.tenantId, startDate, endDate, cusPartnerId: value, cusTenantId });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { startDate, endDate, total, sumImport, sumExport, processing, declared, released, inspected } = this.props.statistics;
    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    const datePicker = (
      <div>
        <Select showSearch optionFilterProp="children" style={{ width: 160 }}
          onChange={this.handleClientSelectChange} defaultValue={-1}
          dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
        >
          {clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
            search={`${data.partner_code}${data.name}`}
          >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
          )}
        </Select>
        <RangePicker style={{ width: 200, marginLeft: 8 }} value={[moment(startDate), moment(endDate)]}
          onChange={this.onDateChange} allowClear={false}
        />
      </div>);
    return (
      <Card title={this.msg('stats')}
        extra={datePicker}
      >
        <ul className="statistics-columns">
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('total')}</h4>
              <div className="data">
                <div className="data-num lg text-emphasis">{total}</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('sumImport')}</h4>
              <div className="data">
                <div className="data-num lg text-normal">{sumImport}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('sumExport')}</h4>
              <div className="data">
                <div className="data-num lg text-normal">{sumExport}</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('processing')}</h4>
              <div className="data">
                <div className="data-num lg text-warning">{processing}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('declared')}</h4>
              <div className="data">
                <div className="data-num lg text-info">{declared}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('released')}</h4>
              <div className="data">
                <div className="data-num lg text-success">{released}</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell" style={{ width: 160 }}>
              <h4>{this.msg('inspected')}</h4>
              <div className="data">
                <div className="data-num lg text-error">{inspected}</div>
                <div className="data-percent">
                  {total > 0 ? (inspected / total * 100).toFixed(2) : 0}%
                  <div>{this.msg('inspectedRate')}</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
