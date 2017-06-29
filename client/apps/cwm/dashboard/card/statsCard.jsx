import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card } from 'antd';


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
  render() {
    return (
      <Card title={this.msg('statsReceiving')}>
        <ul className="statistics-columns">
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('totalASN')}</h4>
              <p className="data-num">29</p>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('toReceive')}</h4>
              <p className="data-num">6</p>
            </div>
          </li>
          <li className="col-8">
            <div className="statistics-cell">
              <h4>{this.msg('putawayCompleted')}</h4>
              <p className="data-num">23</p>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
