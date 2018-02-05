import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Icon, Tooltip } from 'antd';
import ChartCard from 'client/components/ChartCard';
import { loadStatsCard } from 'common/reducers/cwmDashboard';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    statsCard: state.cwmDashboard.statsCard,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadStatsCard }
)

export default class OutboundStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    statsCard: PropTypes.shape({
      inbounds: PropTypes.number,
    }),
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { statsCard } = this.props;
    return (
      <Card
        title={this.msg('outboundStats')}
        bodyStyle={{ padding: 0 }}
      >
        <ChartCard
          title={this.msg('totalOutbound')}
          avatar={(
            <img
              alt="indicator"
              style={{ width: 56, height: 56 }}
              src={`${__CDN__}/assets/img/icon-outbound.svg`}
            />
            )}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.outbounds}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('pending')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.soPendings}
          style={{ width: '16%' }}
          type="warning"
          grid
        />
        <ChartCard
          title={this.msg('toAllocate')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.unallocated}
          style={{ width: '16%' }}
          type="processing"
          grid
        />
        <ChartCard
          title={this.msg('toPick')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.allocated}
          style={{ width: '16%' }}
          type="processing"
          grid
        />
        <ChartCard
          title={this.msg('toShip')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.picked}
          style={{ width: '16%' }}
          type="processing"
          grid
        />
        <ChartCard
          title={this.msg('outboundCompleted')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.outboundCompleted}
          style={{ width: '16%' }}
          type="success"
          grid
        />
      </Card>
    );
  }
}
