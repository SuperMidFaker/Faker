import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Dropdown, Icon, Menu } from 'antd';
import { MiniBar, Field } from 'client/components/Charts';
import ChartCard from 'client/components/ChartCard';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  exportStats: state.cmsDashboard.exportStats,
}))

export default class ExportStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    exportStats: PropTypes.object.isRequired,
  }
  state = {
    amount: 0,
    count: 0,
    currency: 'CNY',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.exportStats !== this.props.exportStats) {
      if (this.state.currency === 'USD') {
        this.setState({
          amount: nextProps.exportStats.total_usd,
          count: nextProps.exportStats.count,
        });
      } else if (this.state.currency === 'CNY') {
        this.setState({
          amount: nextProps.exportStats.total_cny,
          count: nextProps.exportStats.count,
        });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleMenuClick = (e) => {
    if (e.key === 'USD') {
      this.setState({ currency: e.key, amount: this.props.exportStats.total_usd });
    } else if (e.key === 'CNY') {
      this.setState({ currency: e.key, amount: this.props.exportStats.total_cny });
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
        total={`${currency}` === 'CNY' ? `￥${amount}` : `$${amount}`}
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
