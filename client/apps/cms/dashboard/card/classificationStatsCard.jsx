import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card } from 'antd';

import { formatMsg } from '../message.i18n';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadCmsItemsStats } from 'common/reducers/cmsDashboard';
import Strip from 'client/components/Strip';


function fetchData({ state, dispatch }) {
  return dispatch(loadCmsItemsStats({ tenantId: state.account.tenantId }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    itemsStats: state.cmsDashboard.itemsStats,
  }),
  { loadCmsItemsStats }
)

export default class ClassificationStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    itemsStats: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const {
      repoCount, classifiedItems, pendingItems, unclassifiedItems,
    } = this.props.itemsStats;
    return (
      <Card
        title={this.msg('classificationStats')}
        extra={<div style={{ width: 300, marginTop: 4 }}>
          <Strip parts={{ success: classifiedItems, warning: pendingItems, error: unclassifiedItems }} hints={['已归类', '归类待定', '未归类']} />
        </div>}
      >
        <ul className="statistics-columns">
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('repoCount')}</h4>
              <div className="data">
                <div className="data-num text-emphasis">{repoCount}</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('classifiedItems')}</h4>
              <div className="data">
                <div className="data-num text-success">{classifiedItems}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('pendingItems')}</h4>
              <div className="data">
                <div className="data-num text-warning">{pendingItems}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('unclassifiedItems')}</h4>
              <div className="data">
                <div className="data-num text-error">{unclassifiedItems}</div>
              </div>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
