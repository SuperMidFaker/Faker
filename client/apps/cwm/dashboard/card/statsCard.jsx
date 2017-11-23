import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker, Progress } from 'antd';
import { loadStatsCard } from 'common/reducers/cwmDashboard';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;

@injectIntl
@connect(
  state => ({
    statsCard: state.cwmDashboard.statsCard,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadStatsCard }
)

export default class StatsCard extends Component {
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
        <RangePicker onChange={this.onDateChange} defaultValue={[moment(new Date(), 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')]}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }} allowClear={false}
        />
      </div>);
    return (
      <Card title={this.msg('stats')}
        extra={datePicker} hoverable={false} bodyStyle={{ padding: 0 }}
      >
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('totalInbound')}</h4>
            <div className="data">
              <div className="data-num lg text-emphasis">{statsCard.inbounds}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('toReceive')}</h4>
            <div className="data">
              <div className="data-num lg text-warning">{statsCard.creates}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('received')}</h4>
            <div className="data">
              <div className="data-num lg text-success">{statsCard.received}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('totalOutbound')}</h4>
            <div className="data">
              <div className="data-num lg text-emphasis">{statsCard.outbounds}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('toAllocate')}</h4>
            <div className="data">
              <div className="data-num lg text-warning">{statsCard.unallocated}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('toPick')}</h4>
            <div className="data">
              <div className="data-num lg text-info">{statsCard.allocated}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('toShip')}</h4>
            <div className="data">
              <div className="data-num lg text-info">{statsCard.picked}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('shippingCompleted')}</h4>
            <div className="data">
              <div className="data-num lg text-success">{statsCard.shipped}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('待同步入库备案')}</h4>
            <div className="data">
              <div className="data-num lg text-warning">{statsCard.entry}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('待同步分拨出库备案')}</h4>
            <div className="data">
              <div className="data-num lg text-warning">{statsCard.portions}</div>
            </div>
          </div>
        </Card.Grid>

        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('receipts')}</h4>
            <div className="chart">
              <Progress type="dashboard" percent={statsCard.inboundProducts ? Number((statsCard.receipts / statsCard.inboundProducts * 100).toFixed(1)) : 0} width={80} />
              <p>{this.msg('tasksTotal')}: {statsCard.inboundProducts} Items</p>
              <p>{this.msg('tasksCompleted')}: {statsCard.receipts} Items</p>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('putaways')}</h4>
            <div className="chart">
              <Progress type="dashboard" percent={statsCard.inboundProducts ? Number((statsCard.putaways / statsCard.inboundProducts * 100).toFixed(1)) : 0} width={80} />
              <p>{this.msg('tasksTotal')}: {statsCard.inboundProducts} Items</p>
              <p>{this.msg('tasksCompleted')}: {statsCard.putaways} Items</p>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('pickings')}</h4>
            <div className="chart">
              <Progress type="dashboard" percent={statsCard.outboundDetails ? Number((statsCard.pickings / statsCard.outboundDetails * 100).toFixed(1)) : 0} width={80} />
              <p>{this.msg('tasksTotal')}: {statsCard.outboundDetails} Items</p>
              <p>{this.msg('tasksCompleted')}: {statsCard.pickings} Items</p>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('shipments')}</h4>
            <div className="chart">
              <Progress type="dashboard" percent={statsCard.outboundDetails ? Number((statsCard.shipments / statsCard.outboundDetails * 100).toFixed(1)) : 0} width={80} />
              <p>{this.msg('tasksTotal')}: {statsCard.outboundDetails} Items</p>
              <p>{this.msg('tasksCompleted')}: {statsCard.shipments} Items</p>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('replenishments')}</h4>
            <div className="chart">
              <Progress type="dashboard" percent={0} width={80} />
              <p>{this.msg('tasksTotal')}: 0 Items</p>
              <p>{this.msg('tasksCompleted')}: 0 Items</p>
            </div>
          </div>
        </Card.Grid>
      </Card>
    );
  }
}
