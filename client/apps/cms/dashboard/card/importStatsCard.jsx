import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Tooltip } from 'antd';
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
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadStatsCard }
)

export default class ImportStatsCard extends Component {
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
      <ChartCard
        bordered={false}
        title="进口金额"
        action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
        total={yuan(6560)}
        footer={<Field label="进口量" value="600" />}
        contentHeight={46}
      >
        <MiniBar
          height={46}
          data={statsCard.data}
        />
      </ChartCard>
    );
  }
}
