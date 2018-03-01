import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
    exportStats: PropTypes.shape({ count: PropTypes.number }).isRequired,
  }
  state = {
    amount: 0,
    count: 0,
    currency: 'CNY',
    mockData: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.exportStats !== this.props.exportStats) {
      if (this.state.currency === 'USD') {
        this.setState({
          amount: nextProps.exportStats.total_usd,
          count: nextProps.exportStats.count,
          mockData: nextProps.exportStats.usdMockData,
        });
      } else if (this.state.currency === 'CNY') {
        this.setState({
          amount: nextProps.exportStats.total_cny,
          count: nextProps.exportStats.count,
          mockData: nextProps.exportStats.cnyMockData,
        });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleMenuClick = (e) => {
    if (e.key === 'USD') {
      this.setState({
        currency: e.key,
        amount: this.props.exportStats.total_usd,
        mockData: this.props.exportStats.usdMockData,
      });
    } else if (e.key === 'CNY') {
      this.setState({
        currency: e.key,
        amount: this.props.exportStats.total_cny,
        mockData: this.props.exportStats.cnyMockData,
      });
    }
  }
  render() {
    const {
      amount, count, currency, mockData,
    } = this.state;
    const menu = (<Menu key={currency} onClick={this.handleMenuClick}>
      <Menu.Item key="USD">USD</Menu.Item>
      <Menu.Item key="CNY">CNY</Menu.Item>
    </Menu>);
    return (
      <ChartCard
        bordered={false}
        title="出口金额"
        action={<Dropdown overlay={menu}><Icon type="ellipsis" /></Dropdown>}
        total={`${currency}` === 'CNY' ? `￥${amount.toFixed(2)}` : `$${amount.toFixed(2)}`}
        footer={<Field label="出口量" value={count} />}
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
