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

export default class InboundStatsCard extends Component {
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
        title={this.msg('inboundStats')}
        bodyStyle={{ padding: 0 }}
      >
        <ChartCard
          title={this.msg('totalInbound')}
          avatar={(
            <img
              alt="indicator"
              style={{ width: 56, height: 56 }}
              src={`${__CDN__}/assets/img/icon-inbound.svg`}
            />
            )}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.inbounds}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('asnPending')}
          total={statsCard.asnPendings}
          style={{ width: '20%' }}
          type="warning"
          link="/cwm/receiving/asn"
          grid
        />
        <ChartCard
          title={this.msg('toReceive')}
          total={statsCard.creates}
          style={{ width: '20%' }}
          type="processing"
          grid
        />
        <ChartCard
          title={this.msg('toPutAway')}
          total={statsCard.toPutAways}
          style={{ width: '20%' }}
          type="processing"
          grid
        />
        <ChartCard
          title={this.msg('inboundCompleted')}
          total={statsCard.inboundCompleted}
          style={{ width: '20%' }}
          type="success"
          grid
        />
      </Card>
    );
  }
}
