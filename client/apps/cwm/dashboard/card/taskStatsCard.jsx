import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker, Progress } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const RangePicker = DatePicker.RangePicker;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,

  }),
  { }
)

export default class TaskStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
  }
  state = {
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const datePicker = (
      <div>
        <RangePicker onChange={this.onDateChange}
          ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }} allowClear={false}
        />
      </div>);
    return (
      <Card title={this.msg('statsTask')}
        extra={datePicker}
      >
        <ul className="statistics-columns">
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('receipts')}</h4>
              <Progress type="dashboard" percent={75} width={80} />
              <p>Total: 561 Items</p>
              <p>Completed: 165 Items</p>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('putaways')}</h4>
              <Progress type="dashboard" percent={75} width={80} />
              <p>Total: 561 Items</p>
              <p>Completed: 165 Items</p>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('pickings')}</h4>
              <Progress type="dashboard" percent={75} width={80} />
              <p>Total: 561 Items</p>
              <p>Completed: 165 Items</p>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('shipments')}</h4>
              <Progress type="dashboard" percent={75} width={80} />
              <p>Total: 561 Items</p>
              <p>Completed: 165 Items</p>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('replenishments')}</h4>
              <Progress type="dashboard" percent={75} width={80} />
              <p>Total: 561 Items</p>
              <p>Completed: 165 Items</p>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
