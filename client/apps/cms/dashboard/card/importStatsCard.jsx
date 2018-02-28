import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Dropdown, Icon, Menu } from 'antd';
import { MiniBar, Field } from 'client/components/Charts';
import ChartCard from 'client/components/ChartCard';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadIEStats } from 'common/reducers/cmsDashboard';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

function fetchData({ state, dispatch }) {
  const startDate = `${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`;
  const endDate = `${moment(new Date()).format('YYYY-MM-DD')} 23:59:59`;
  return dispatch(loadIEStats({
    tenantId: state.account.tenantId,
    startDate,
    endDate,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(state => ({
  importStats: state.cmsDashboard.importStats,
}))

export default class ImportStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    importStats: PropTypes.shape({ count: PropTypes.number }).isRequired,
  }
  state = {
    amount: 0,
    count: 0,
    currency: 'CNY',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.importStats !== this.props.importStats) {
      if (this.state.currency === 'USD') {
        this.setState({
          amount: nextProps.importStats.total_usd,
          count: nextProps.importStats.count,
        });
      } else if (this.state.currency === 'CNY') {
        this.setState({
          amount: nextProps.importStats.total_cny,
          count: nextProps.importStats.count,
        });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleMenuClick = (e) => {
    if (e.key === 'USD') {
      this.setState({ currency: e.key, amount: this.props.importStats.total_usd });
    } else if (e.key === 'CNY') {
      this.setState({ currency: e.key, amount: this.props.importStats.total_cny });
    }
  }
  render() {
    const { amount, count, currency } = this.state;
    const menu = (<Menu key={currency} onClick={this.handleMenuClick}>
      <Menu.Item key="USD">USD</Menu.Item>
      <Menu.Item key="CNY">CNY</Menu.Item>
    </Menu>);
    const mockData = [];
    const beginDay = (new Date().getTime()) - (1000 * 60 * 60 * 24 * 30);
    for (let i = 0; i < 30; i += 1) {
      mockData.push({
        x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
        y: Math.floor(Math.random() * 100) + 10,
      });
    }
    return (
      <ChartCard
        bordered={false}
        title="进口金额"
        action={<Dropdown overlay={menu}><Icon type="ellipsis" /></Dropdown>}
        total={`${currency}` === 'CNY' ? `￥${amount.toFixed(2)}` : `$${amount.toFixed(2)}`}
        footer={<Field label="进口量" value={count} />}
        contentHeight={64}
      >
        <MiniBar
          height={64}
          data={mockData}
        />
      </ChartCard>
    );
  }
}
