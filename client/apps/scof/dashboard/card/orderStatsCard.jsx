import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Icon, Tooltip } from 'antd';
import ChartCard from 'client/components/ChartCard';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    orderStats: state.sofDashboard.orderStats,
  }),
  {}
)

export default class OrderStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    orderStats: PropTypes.shape({
      totalOrders: PropTypes.number,
    }),
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { orderStats } = this.props;
    return (
      <Card
        title={this.msg('orderStats')}
        bodyStyle={{ padding: 0 }}
      >
        <ChartCard
          title={this.msg('totalOrders')}
          avatar={(
            <img
              alt="indicator"
              style={{ width: 56, height: 56 }}
              src="https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png"
            />
            )}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.totalOrders || 0}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('pending')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.pending || 0}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('processing')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.processing || 0}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('urgent')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.urgent || 0}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('completed')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.completed || 0}
          style={{ width: '20%' }}
          grid
        />
      </Card>
    );
  }
}
