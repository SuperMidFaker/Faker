import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Dropdown, Icon, Menu } from 'antd';
import { MiniBar, yuan, Field } from 'client/components/Charts';
import ChartCard from 'client/components/ChartCard';
import { loadStatsCard } from 'common/reducers/cwmDashboard';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    statsCard: state.cwmDashboard.statsCard,
  }),
  { loadStatsCard }
)

export default class ImportStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    // const { statsCard } = this.props;
    const menu = (<Menu>
      <Menu.Item>USD</Menu.Item>
      <Menu.Item>CNY</Menu.Item>
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
        total={yuan(6560)}
        footer={<Field label="进口量" value="600" />}
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
