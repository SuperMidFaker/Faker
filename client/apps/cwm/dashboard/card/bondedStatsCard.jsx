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
  componentDidMount() {
    if (window.localStorage) {
      const fv = {
        status: 'all', startDate: '', endDate: '',
      };
      window.localStorage.bondedStatus = JSON.stringify(fv);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleLinkClick = (type) => {
    const { startDate, endDate } = this.props;
    if (window.localStorage && window.localStorage.bondedStatus) {
      let fv = JSON.parse(window.localStorage.bondedStatus);
      fv.startDate = startDate;
      fv.endDate = endDate;
      if (type === 'entryToSync') {
        fv = { ...fv, status: 'processing' };
      } else if (type === 'normalToClear') {
        fv = { ...fv, status: 'completed' };
      } else if (type === 'normalToExit') {
        fv = { ...fv, status: 'cleared' };
      } else if (type === 'portionToSync') {
        fv = { ...fv, status: 'processing' };
      } else if (type === 'portionToClear') {
        fv = { ...fv, status: 'completed' };
      }
      window.localStorage.bondedStatus = JSON.stringify(fv);
    }
  }
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
          link="/cwm/supervision/shftz/entry?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('entryToSync')}
        />
        <ChartCard
          title={this.msg('normalToClear')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.normalToClear}
          style={{ width: '20%' }}
          link="/cwm/supervision/shftz/release/normal?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('normalToClear')}
        />
        <ChartCard
          title={this.msg('normalToExit')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.normalToExit}
          style={{ width: '20%' }}
          link="/cwm/supervision/shftz/release/normal?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('normalToExit')}
        />
        <ChartCard
          title={this.msg('portionToSync')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.portionToSync}
          style={{ width: '20%' }}
          link="/cwm/supervision/shftz/release/portion?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('portionToSync')}
        />
        <ChartCard
          title={this.msg('portionToClear')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.portionToClear}
          style={{ width: '20%' }}
          link="/cwm/supervision/shftz/release/portion?from=dashboard"
          grid
          onClick={() => this.handleLinkClick('portionToClear')}
        />
      </Card>
    );
  }
}
