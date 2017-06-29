import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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

export default class StatsCard extends Component {
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
        <RangePicker onChange={this.onDateChange} allowClear={false} />
      </div>);
    return (
      <Card title={this.msg('stats')}
        extra={datePicker}
      >
        <ul className="statistics-columns">
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('total')}</h4>
              <div className="data">
                <div className="data-num lg text-emphasis">29</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('sumImport')}</h4>
              <div className="data">
                <div className="data-num lg text-normal">6</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('sumExport')}</h4>
              <div className="data">
                <div className="data-num lg text-normal">23</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('processing')}</h4>
              <div className="data">
                <div className="data-num lg text-warning">6</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('declared')}</h4>
              <div className="data">
                <div className="data-num lg text-info">3</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('released')}</h4>
              <div className="data">
                <div className="data-num lg text-success">20</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell" style={{ width: 160 }}>
              <h4>{this.msg('inspected')}</h4>
              <div className="data">
                <div className="data-num lg text-error">3</div>
                <div className="data-percent">
                  {1.6}%
                  <div>{this.msg('inspectedRate')}</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
