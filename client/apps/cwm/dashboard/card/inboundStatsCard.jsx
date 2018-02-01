import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker, Icon, Tooltip } from 'antd';
import ChartCard from 'client/components/ChartCard';
import { loadStatsCard } from 'common/reducers/cwmDashboard';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { RangePicker } = DatePicker;

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
    const datePicker = (
      <div>
        <RangePicker
          onChange={this.onDateChange}
          defaultValue={[moment(new Date(), 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')]}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
          allowClear={false}
        />
      </div>);
    return (
      <Card
        title={this.msg('inboundStats')}
        extra={datePicker}
        bodyStyle={{ padding: 0 }}
      >
        <ChartCard
          title={this.msg('totalInbound')}
          avatar={(
            <img
              alt="indicator"
              style={{ width: 56, height: 56 }}
              src="https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png"
            />
            )}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.inbounds}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('pending')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.creates}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('toReceive')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.creates}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('toPutAway')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.creates}
          style={{ width: '20%' }}
          grid
        />
        <ChartCard
          title={this.msg('inboundCompleted')}
          action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
          total={statsCard.received}
          style={{ width: '20%' }}
          grid
        />
      </Card>
    );
  }
}
