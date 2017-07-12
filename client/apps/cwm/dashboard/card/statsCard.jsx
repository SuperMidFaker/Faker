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
    tenantId: state.account.tenantId,
    statsCard: state.cwmDashboard.statsCard,
  }),
  { loadStatsCard }
)

export default class StatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
  }
  componentWillMount() {
    this.props.loadStatsCard();
  }
  onDateChange = (data, dataString) => {
    this.props.loadStatsCard(dataString[0], dataString[1]);
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { statsCard } = this.props;
    const datePicker = (
      <div>
        <RangePicker onChange={this.onDateChange}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }} allowClear={false}
        />
      </div>);
    return (
      <Card title={this.msg('stats')}
        extra={datePicker} noHovering bodyStyle={{ padding: 0 }}
      >
        <Card.Grid style={{ width: '14%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('totalASN')}</h4>
            <div className="data">
              <div className="data-num lg text-emphasis">{statsCard.inbounds}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '12%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('toReceive')}</h4>
            <div className="data">
              <div className="data-num lg text-info">{statsCard.creates}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '12%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('received')}</h4>
            <div className="data">
              <div className="data-num lg text-success">{statsCard.received}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '14%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('totalSO')}</h4>
            <div className="data">
              <div className="data-num lg text-emphasis">{statsCard.outbounds}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '12%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('toAllocate')}</h4>
            <div className="data">
              <div className="data-num lg text-warning">{statsCard.unallocated}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '12%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('toPick')}</h4>
            <div className="data">
              <div className="data-num lg text-info">{statsCard.allocated}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '12%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('pickingCompleted')}</h4>
            <div className="data">
              <div className="data-num lg text-info">{statsCard.picked}</div>
            </div>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '12%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('shippingCompleted')}</h4>
            <div className="data">
              <div className="data-num lg text-success">{statsCard.shipped}</div>
            </div>
          </div>
        </Card.Grid>

        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('receipts')}</h4>
            <Progress type="dashboard" percent={(statsCard.receipts / statsCard.inboundProducts * 100).toFixed(1)} width={80} />
            <p>Total: {statsCard.inboundProducts} Items</p>
            <p>Completed: {statsCard.receipts} Items</p>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('putaways')}</h4>
            <Progress type="dashboard" percent={(statsCard.putaways / statsCard.inboundProducts * 100).toFixed(1)} width={80} />
            <p>Total: {statsCard.inboundProducts} Items</p>
            <p>Completed: {statsCard.putaways} Items</p>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('pickings')}</h4>
            <Progress type="dashboard" percent={(statsCard.pickings / statsCard.outboundDetails * 100).toFixed(1)} width={80} />
            <p>Total: {statsCard.outboundDetails} Items</p>
            <p>Completed: {statsCard.pickings} Items</p>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('shipments')}</h4>
            <Progress type="dashboard" percent={(statsCard.shipments / statsCard.outboundDetails * 100).toFixed(1)} width={80} />
            <p>Total: {statsCard.outboundDetails} Items</p>
            <p>Completed: {statsCard.shipments} Items</p>
          </div>
        </Card.Grid>
        <Card.Grid style={{ width: '20%' }} className="statistics-columns">
          <div className="statistics-cell">
            <h4>{this.msg('replenishments')}</h4>
            <Progress type="dashboard" percent={75} width={80} />
            <p>Total: 561 Items</p>
            <p>Completed: 165 Items</p>
          </div>
        </Card.Grid>

      </Card>
    );
  }
}
