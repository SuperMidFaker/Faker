import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Icon, Tooltip } from 'antd';
import ChartCard from 'client/components/ChartCard';
import { yuan, usd } from 'client/components/Charts';
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

export default class InvoiceStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    statsCard: PropTypes.shape({
      inbounds: PropTypes.number,
    }),
  }
  componentWillMount() {
    const { defaultWhse } = this.props;
    this.props.loadStatsCard(moment(new Date()).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD'), defaultWhse.code);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      const { defaultWhse } = nextProps;
      this.props.loadStatsCard(moment(new Date()).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD'), defaultWhse.code);
    }
  }
  onDateChange = (data, dataString) => {
    const { defaultWhse } = this.props;
    this.props.loadStatsCard(dataString[0], dataString[1], defaultWhse.code);
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { statsCard } = this.props;
    return (
      <Card
        title={this.msg('invoiceStats')}
        bodyStyle={{ padding: 0 }}
      >
        <ChartCard
          title={this.msg('totalInvoices')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.inbounds}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('totalRMBAmount')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={yuan(126560)}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('totalUSDAmount')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={usd(26560)}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('toShip')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.creates}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('shipped')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.received}
          style={{ width: '20%' }}
          grid
        />
      </Card>
    );
  }
}
