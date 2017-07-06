import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker, Radio, Select } from 'antd';
import moment from 'moment';
import { Link } from 'react-router';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadCmsStatistics } from 'common/reducers/cmsDashboard';
import { loadPartnersByTypes } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  const firstDay = new Date();
  firstDay.setDate(1);
  const startDate = `${moment(state.cmsDashboard.statistics.startDate || firstDay).format('YYYY-MM-DD')} 00:00:00`;
  const endDate = `${moment(state.cmsDashboard.statistics.endDate || new Date()).format('YYYY-MM-DD')} 23:59:59`;
  const clientView = JSON.stringify({ tenantIds: [], partnerIds: [] });
  const promises = [dispatch(loadCmsStatistics({ tenantId: state.account.tenantId, startDate, endDate, clientView })),
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
    const clientView = this.props.statistics.clientView;
    this.props.loadCmsStatistics({ tenantId: this.props.tenantId, startDate: `${dateString[0]} 00:00:00`, endDate: `${dateString[1]} 23:59:59`, clientView });
  }
  handleClientSelectChange = (value) => {
    const { startDate, endDate } = this.props.statistics;
    const clientView = { tenantIds: [], partnerIds: [] };
    if (value !== -1) {
      const client = this.props.clients.find(clt => clt.partner_id === value);
      if (client.partner_id !== null) {
        clientView.partnerIds.push(client.partner_id);
      } else {
        clientView.tenantIds.push(client.tid);
      }
    }
    this.props.loadCmsStatistics({ tenantId: this.props.tenantId, startDate, endDate, clientView: JSON.stringify(clientView) });
    if (window.localStorage) {
      window.localStorage.cmsDelegationListFilters =
      JSON.stringify({ ...JSON.parse(window.localStorage.cmsDelegationListFilters), clientView });
    }
  }
  handleLinkDelg = (type) => {
    const { startDate, endDate } = this.props.statistics;
    if (window.localStorage) {
      let fv = JSON.parse(window.localStorage.cmsDelegationListFilters);
      if (type === 'total') {
        fv = { ...fv, acptDate: [startDate, endDate], ietype: 'all', status: 'all' };
      } else if (type === 'sumImport') {
        fv = { ...fv, acptDate: [startDate, endDate], ietype: 'import', status: 'all' };
      } else if (type === 'sumExport') {
        fv = { ...fv, acptDate: [startDate, endDate], ietype: 'export', status: 'all' };
      } else if (type === 'processing') {
        fv = { ...fv, acptDate: [startDate, endDate], ietype: 'all', status: 'undeclared' };
      } else if (type === 'declared') {
        fv = { ...fv, acptDate: [startDate, endDate], ietype: 'all', status: 'declared' };
      } else if (type === 'released') {
        fv = { ...fv, acptDate: [startDate, endDate], ietype: 'all', status: 'finished' };
      }
      window.localStorage.cmsDelegationListFilters = JSON.stringify(fv);
    }
    return '/clearance/delegation';
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { startDate, endDate, total, sumImport, sumExport, processing, declared, released, inspected, declcount } = this.props.statistics;
    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    const datePicker = (
      <div>
        <RadioGroup defaultValue="502" onChange={this.handleCurrencyChange}>
          <RadioButton value="502">USD</RadioButton>
          <RadioButton value="142">RMB</RadioButton>
        </RadioGroup>
        <Select showSearch optionFilterProp="children" style={{ width: 160, marginLeft: 8 }}
          onChange={this.handleClientSelectChange} defaultValue={-1}
          dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
        >
          {clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
            search={`${data.partner_code}${data.name}`}
          >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
          )}
        </Select>
        <RangePicker style={{ width: 200, marginLeft: 8 }} value={[moment(startDate), moment(endDate)]}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
          onChange={this.onDateChange} allowClear={false}
        />
      </div>);
    return (
      <Card title={this.msg('stats')}
        extra={datePicker}
      >
        <ul className="statistics-columns">
          <li>
            <div className="statistics-cell">
              <h4>{this.msg('total')}</h4>
              <div className="data">
                <div className="data-num lg text-emphasis">
                  <Link to={() => this.handleLinkDelg('total')} >{total}</Link>
                </div>
                <div className="data-extra">
                  ${1000.00}
                  <div>{this.msg('totalValue')}</div>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li>
            <div className="statistics-cell">
              <h4>{this.msg('sumImport')}</h4>
              <div className="data">
                <div className="data-num lg text-normal">
                  <Link to={() => this.handleLinkDelg('sumImport')} >{sumImport}</Link>
                </div>
                <div className="data-extra">
                  ${800.00}
                  <div>{this.msg('sumImportValue')}</div>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="statistics-cell">
              <h4>{this.msg('sumExport')}</h4>
              <div className="data">
                <div className="data-num lg text-normal">
                  <Link to={() => this.handleLinkDelg('sumExport')} >{sumExport}</Link>
                </div>
                <div className="data-extra">
                  ${200.00}
                  <div>{this.msg('sumExportValue')}</div>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li>
            <div className="statistics-cell">
              <h4>{this.msg('processing')}</h4>
              <div className="data">
                <div className="data-num lg text-warning">
                  <Link to={() => this.handleLinkDelg('processing')} >{processing}</Link>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="statistics-cell">
              <h4>{this.msg('declared')}</h4>
              <div className="data">
                <div className="data-num lg text-info">
                  <Link to={() => this.handleLinkDelg('declared')} >{declared}</Link>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="statistics-cell">
              <h4>{this.msg('released')}</h4>
              <div className="data">
                <div className="data-num lg text-success">
                  <Link to={() => this.handleLinkDelg('released')} >{released}</Link>
                </div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li>
            <div className="statistics-cell" style={{ width: 160 }}>
              <h4>{this.msg('inspected')}</h4>
              <div className="data">
                <div className="data-num lg text-error">{inspected}</div>
                <div className="data-extra">
                  {declcount > 0 ? (inspected / declcount * 100).toFixed(2) : 0}%
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
