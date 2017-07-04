import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Card, DatePicker } from 'antd';
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

export default class ShippingStatsCard extends Component {
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
      <Card title={this.msg('statsShipping')}
        extra={datePicker}
      >
        <ul className="statistics-columns">
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('totalSO')}</h4>
              <div className="data">
                <div className="data-num lg text-emphasis">29</div>
              </div>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('toAllocate')}</h4>
              <div className="data">
                <div className="data-num lg text-warning">29</div>
              </div>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('pickingCompleted')}</h4>
              <div className="data">
                <div className="data-num lg text-info">29</div>
              </div>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('packingVerified')}</h4>
              <div className="data">
                <div className="data-num lg text-success">29</div>
              </div>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
