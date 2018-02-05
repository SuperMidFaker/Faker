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

export default class BondedStatsCard extends Component {
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
        title={this.msg('bondedStats')}
        bodyStyle={{ padding: 0 }}
      >
        <ChartCard
          title={this.msg('entryToSync')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.entryToSync}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('normalToClear')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.normalToClear}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('normalToExit')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.normalToExit}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('portionToSync')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.portionToSync}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('portionToClear')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.portionToClear}
          style={{ width: '20%' }}
          grid
        />
      </Card>
    );
  }
}
