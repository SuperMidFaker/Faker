import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker, Radio, Select } from 'antd';
import moment from 'moment';
import { Link } from 'react-router';
import currencyFormatter from 'currency-formatter';
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
  const promises = [dispatch(loadCmsStatistics({
    tenantId: state.account.tenantId, startDate, endDate, clientView,
  })),
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
    listFilter: state.cmsDelegation.listFilter,
  }),
  { loadCmsStatistics }
)

export default class StatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    statistics: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
  }
  state = {
    totalValue: 0,
    sumImportValue: 0,
    sumExportValue: 0,
    currency: 'USD',
  }
  componentDidMount() {
    if (window.localStorage && window.localStorage.cmsDelegationListFilters) {
      let fv = JSON.parse(window.localStorage.cmsDelegationListFilters);
      fv = {
        ...fv, acptDate: [], ietype: 'all', status: 'all', clientView: { tenantIds: [], partnerIds: [] },
      };
      window.localStorage.cmsDelegationListFilters = JSON.stringify(fv);
    } else if (window.localStorage && !window.localStorage.cmsDelegationListFilters) {
      const fv = {
        acptDate: [], ietype: 'all', status: 'all', clientView: { tenantIds: [], partnerIds: [] },
      };
      window.localStorage.cmsDelegationListFilters = JSON.stringify(fv);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.statistics !== this.props.statistics) {
      if (this.state.currency === 'USD') {
        this.setState({
          totalValue: nextProps.statistics.totVals.total_usd,
          sumImportValue: nextProps.statistics.totImVals.total_usd,
          sumExportValue: nextProps.statistics.totExVals.total_usd,
        });
      } else if (this.state.currency === 'CNY') {
        this.setState({
          totalValue: nextProps.statistics.totVals.total_cny,
          sumImportValue: nextProps.statistics.totImVals.total_cny,
          sumExportValue: nextProps.statistics.totExVals.total_cny,
        });
      }
    }
  }
  onDateChange = (value, dateString) => {
    const clientView = this.props.statistics.clientView;
    this.props.loadCmsStatistics({
      tenantId: this.props.tenantId, startDate: `${dateString[0]} 00:00:00`, endDate: `${dateString[1]} 23:59:59`, clientView,
    });
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
    this.props.loadCmsStatistics({
      tenantId: this.props.tenantId, startDate, endDate, clientView: JSON.stringify(clientView),
    });
    if (window.localStorage) {
      window.localStorage.cmsDelegationListFilters =
      JSON.stringify({ ...JSON.parse(window.localStorage.cmsDelegationListFilters), clientView });
    }
  }
  handleLinkClick = (type) => {
    const { startDate, endDate } = this.props.statistics;
    if (window.localStorage && window.localStorage.cmsDelegationListFilters) {
      let fv = JSON.parse(window.localStorage.cmsDelegationListFilters);
      fv.acptDate = [startDate, endDate];
      if (type === 'total') {
        fv = { ...fv, ietype: 'all', status: 'all' };
      } else if (type === 'sumImport') {
        fv = { ...fv, ietype: 'import', status: 'all' };
      } else if (type === 'sumExport') {
        fv = { ...fv, ietype: 'export', status: 'all' };
      } else if (type === 'processing') {
        fv = { ...fv, ietype: 'all', status: 'undeclared' };
      } else if (type === 'declared') {
        fv = { ...fv, ietype: 'all', status: 'declared' };
      } else if (type === 'released') {
        fv = { ...fv, ietype: 'all', status: 'finished' };
      }
      window.localStorage.cmsDelegationListFilters = JSON.stringify(fv);
    }
  }
  handleCurrencyChange = (ev) => {
    const { totVals, totImVals, totExVals } = this.props.statistics;
    if (ev.target.value === 'USD') {
      this.setState({
        currency: 'USD', totalValue: totVals.total_usd, sumImportValue: totImVals.total_usd, sumExportValue: totExVals.total_usd,
      });
    } else if (ev.target.value === 'CNY') {
      this.setState({
        currency: 'CNY', totalValue: totVals.total_cny, sumImportValue: totImVals.total_cny, sumExportValue: totExVals.total_cny,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const {
      startDate, endDate, total, sumImport, sumExport, processing, declared, released, inspected, declcount,
    } = this.props.statistics;
    const {
      totalValue, sumImportValue, sumExportValue, currency,
    } = this.state;
    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    const datePicker = (
      <div>
        <RadioGroup defaultValue="USD" onChange={this.handleCurrencyChange}>
          <RadioButton value="USD">USD</RadioButton>
          <RadioButton value="CNY">CNY</RadioButton>
        </RadioGroup>
        <Select showSearch optionFilterProp="children" style={{ width: 160, marginLeft: 8 }}
          onChange={this.handleClientSelectChange} defaultValue={-1}
          dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
        >
          {clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
            search={`${data.partner_code}${data.name}`}
          >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
          </Option>))}
        </Select>
        <RangePicker style={{ marginLeft: 8 }} value={[moment(startDate), moment(endDate)]}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
          onChange={this.onDateChange} allowClear={false}
        />
      </div>);
    return (
      <Card title={this.msg('stats')}
        extra={datePicker} hoverable={false} bodyStyle={{ padding: 0 }}
      >
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('total')}</h4>
            <div className="data">
              <div className="data-num lg text-emphasis">
                <Link to="/clearance/delegation?from='dashboard'" onClick={() => this.handleLinkClick('total')} >{total}</Link>
              </div>
              <div className="data-extra">
                {currencyFormatter.format(totalValue, { code: currency })}
                <div>{this.msg('totalValue')}</div>
              </div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '35%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('sumImport')}</h4>
            <div className="data">
              <div className="data-num lg text-normal">
                <Link to="/clearance/delegation?from='dashboard'" onClick={() => this.handleLinkClick('sumImport')} >{sumImport}</Link>
              </div>
              <div className="data-extra">
                {currencyFormatter.format(sumImportValue, { code: currency })}
                <div>{this.msg('sumImportValue')}</div>
              </div>
            </div>
          </div>
          <div className="statistics-cell">
            <h4>{this.msg('sumExport')}</h4>
            <div className="data">
              <div className="data-num lg text-normal">
                <Link to="/clearance/delegation?from='dashboard'" onClick={() => this.handleLinkClick('sumExport')} >{sumExport}</Link>
              </div>
              <div className="data-extra">
                {currencyFormatter.format(sumExportValue, { code: currency })}
                <div>{this.msg('sumExportValue')}</div>
              </div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '30%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('processing')}</h4>
            <div className="data">
              <div className="data-num lg text-warning">
                <Link to="/clearance/delegation?from='dashboard'" onClick={() => this.handleLinkClick('processing')} >{processing}</Link>
              </div>
            </div>
          </div>

          <div className="statistics-cell">
            <h4>{this.msg('declared')}</h4>
            <div className="data">
              <div className="data-num lg text-info">
                <Link to="/clearance/delegation?from='dashboard'" onClick={() => this.handleLinkClick('declared')} >{declared}</Link>
              </div>
            </div>
          </div>
          <div className="statistics-cell">
            <h4>{this.msg('released')}</h4>
            <div className="data">
              <div className="data-num lg text-success">
                <Link to="/clearance/delegation?from='dashboard'" onClick={() => this.handleLinkClick('released')}>{released}</Link>
              </div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '15%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('inspected')}</h4>
            <div className="data">
              <div className="data-num lg text-error">
                <Link to="/clearance/cusdecl?status='inspect'" onClick={() => this.handleLinkClick('inspected')}>{inspected}</Link>
              </div>
              <div className="data-extra">
                {declcount > 0 ? (inspected / declcount * 100).toFixed(2) : 0}%
                <div>{this.msg('inspectedRate')}</div>
              </div>
            </div>
          </div>
        </Card.Grid>
      </Card>
    );
  }
}
