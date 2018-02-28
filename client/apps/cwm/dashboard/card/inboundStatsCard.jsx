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
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }),
  }
  componentDidMount() {
    if (window.localStorage) {
      const fv = {
        status: 'all', startDate: '', endDate: '', ownerCode: 'all',
      };
      window.localStorage.cwmReceiveInboundLists = JSON.stringify(fv);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleLinkClick = (type) => {
    const { startDate, endDate } = this.props;
    if (window.localStorage && window.localStorage.cwmReceiveInboundLists) {
      let fv = JSON.parse(window.localStorage.cwmReceiveInboundLists);
      fv.startDate = startDate;
      fv.endDate = endDate;
      if (type === 'total') {
        fv = { ...fv, status: 'all' };
      } else if (type === 'pending') {
        fv = { ...fv, status: 'pending' };
      } else if (type === 'create') {
        fv = { ...fv, status: 'create' };
      } else if (type === 'receive') {
        fv = { ...fv, status: 'receive' };
      } else if (type === 'inboundCompleted') {
        fv = { ...fv, status: 'completed' };
      }
      window.localStorage.cwmReceiveInboundLists = JSON.stringify(fv);
    }
  }
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
          link="/cwm/receiving/inbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('total')}
        />
        <ChartCard
          title={this.msg('asnPending')}
          total={statsCard.asnPendings}
          style={{ width: '20%' }}
          type="warning"
          link="/cwm/receiving/asn?status=pending"
          grid
          onClick={() => this.handleLinkClick('pending')}
        />
        <ChartCard
          title={this.msg('toReceive')}
          total={statsCard.creates}
          style={{ width: '20%' }}
          type="processing"
          link="/cwm/receiving/inbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('create')}
        />
        <ChartCard
          title={this.msg('toPutAway')}
          total={statsCard.toPutAways}
          style={{ width: '20%' }}
          type="processing"
          link="/cwm/receiving/inbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('receive')}
        />
        <ChartCard
          title={this.msg('inboundCompleted')}
          total={statsCard.inboundCompleted}
          style={{ width: '20%' }}
          link="/cwm/receiving/inbound?from=dashboard"
          type="success"
          grid
          onClick={() => this.handleLinkClick('success')}
        />
      </Card>
    );
  }
}
