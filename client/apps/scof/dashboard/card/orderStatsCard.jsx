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
    loginId: state.account.loginId,
  }),
  {}
)

export default class OrderStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    orderStats: PropTypes.shape({
      totalOrders: PropTypes.number,
    }),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }
  componentDidMount() {
    if (window.localStorage) {
      const fv = {
        progress: 'all',
        transfer: 'all',
        partnerId: '',
        orderType: null,
        expedited: 'all',
        creator: 'all',
        loginId: this.props.loginId,
        startDate: '',
        endDate: '',
      };
      window.localStorage.scofOrderLists = JSON.stringify(fv);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleLinkClick = (type) => {
    const { startDate, endDate } = this.props;
    if (window.localStorage && window.localStorage.scofOrderLists) {
      let fv = JSON.parse(window.localStorage.scofOrderLists);
      fv.startDate = startDate;
      fv.endDate = endDate;
      if (type === 'totalOrders') {
        fv = { ...fv, progress: 'all' };
      } else if (type === 'pending') {
        fv = { ...fv, progress: 'pending' };
      } else if (type === 'processing') {
        fv = { ...fv, progress: 'active' };
      } else if (type === 'urgent') {
        fv = { ...fv, expedited: 'expedited' };
      } else if (type === 'completed') {
        fv = { ...fv, progress: 'completed' };
      }
      window.localStorage.scofOrderLists = JSON.stringify(fv);
    }
  }
  render() {
    const { orderStats } = this.props;
    return (
      <Card
        title={this.msg('orderStats')}
        bodyStyle={{ padding: 0 }}
      >
        <ChartCard
          title={this.msg('totalOrders')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.totalOrders || 0}
          style={{ width: '20%' }}
          link="/scof/shipments?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('totalOrders')}
        />
        <ChartCard
          title={this.msg('pending')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.pending || 0}
          style={{ width: '20%' }}
          type="warning"
          link="/scof/shipments?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('pending')}
        />
        <ChartCard
          title={this.msg('processing')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.processing || 0}
          style={{ width: '20%' }}
          type="processing"
          link="/scof/shipments?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('processing')}
        />
        <ChartCard
          title={this.msg('urgent')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.urgent || 0}
          style={{ width: '20%' }}
          type="error"
          link="/scof/shipments?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('urgent')}
        />
        <ChartCard
          title={this.msg('completed')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={orderStats.completed || 0}
          style={{ width: '20%' }}
          type="success"
          link="/scof/shipments?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('completed')}
        />
      </Card>
    );
  }
}
