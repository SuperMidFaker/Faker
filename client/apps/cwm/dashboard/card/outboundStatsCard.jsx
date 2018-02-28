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
  componentDidMount() {
    if (window.localStorage) {
      const fv = {
        status: 'all', startDate: '', endDate: '', ownerCode: 'all',
      };
      window.localStorage.cwmShipOutboundLists = JSON.stringify(fv);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleLinkClick = (type) => {
    const { startDate, endDate } = this.props;
    if (window.localStorage && window.localStorage.cwmShipOutboundLists) {
      let fv = JSON.parse(window.localStorage.cwmShipOutboundLists);
      fv.startDate = startDate;
      fv.endDate = endDate;
      if (type === 'total') {
        fv = { ...fv, status: 'all' };
      } else if (type === 'pending') {
        fv = { ...fv, status: 'pending' };
      } else if (type === 'toAllocate') {
        fv = { ...fv, status: 'create' };
      } else if (type === 'toPick') {
        fv = { ...fv, status: 'picking' };
      } else if (type === 'toShip') {
        fv = { ...fv, status: 'shipping' };
      } else if (type === 'outboundCompleted') {
        fv = { ...fv, status: 'completed' };
      }
      window.localStorage.cwmShipOutboundLists = JSON.stringify(fv);
    }
  }
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
          link="/cwm/shipping/outbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('total')}
        />
        <ChartCard
          title={this.msg('soPending')}
          total={statsCard.soPendings}
          style={{ width: '16%' }}
          type="warning"
          link="/cwm/shipping/order?status=pending"
          grid
          onClick={() => this.handleLinkClick('pending')}
        />
        <ChartCard
          title={this.msg('toAllocate')}
          total={statsCard.unallocated}
          style={{ width: '16%' }}
          type="processing"
          link="/cwm/shipping/outbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('toAllocate')}
        />
        <ChartCard
          title={this.msg('toPick')}
          total={statsCard.allocated}
          style={{ width: '16%' }}
          type="processing"
          link="/cwm/shipping/outbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('toPick')}
        />
        <ChartCard
          title={this.msg('toShip')}
          total={statsCard.picked}
          style={{ width: '16%' }}
          type="processing"
          link="/cwm/shipping/outbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('toShip')}
        />
        <ChartCard
          title={this.msg('outboundCompleted')}
          total={statsCard.outboundCompleted}
          style={{ width: '16%' }}
          type="success"
          link="/cwm/shipping/outbound?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('outboundCompleted')}
        />
      </Card>
    );
  }
}
