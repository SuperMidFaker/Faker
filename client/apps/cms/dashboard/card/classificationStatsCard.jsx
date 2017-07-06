import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card } from 'antd';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadCmsStatistics } from 'common/reducers/cmsDashboard';
import { loadPartnersByTypes } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import Strip from 'client/components/Strip';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.cmsDashboard.statistics,
    clients: state.partner.partners,
  }),
  { loadCmsStatistics }
)

export default class ClassificationStatsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    statistics: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { total, sumImport, sumExport, released } = this.props.statistics;
    return (
      <Card title={this.msg('classificationStats')}
        extra={<div style={{ width: 300, marginTop: 10 }}><Strip overall={1000} parts={{ success: 800, processing: 180, warning: 20 }} hints={['已归类', '归类待定', '未归类']} /></div>}
      >
        <ul className="statistics-columns">
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('repoCount')}</h4>
              <div className="data">
                <div className="data-num lg text-emphasis">{total}</div>
              </div>
            </div>
          </li>
          <li className="statistics-divider" />
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('classifiedItems')}</h4>
              <div className="data">
                <div className="data-num lg text-success">{released}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('pendingItems')}</h4>
              <div className="data">
                <div className="data-num lg text-info">{sumExport}</div>
              </div>
            </div>
          </li>
          <li className="col-3">
            <div className="statistics-cell">
              <h4>{this.msg('unclassifiedItems')}</h4>
              <div className="data">
                <div className="data-num lg text-warning">{sumImport}</div>
              </div>
            </div>
          </li>
        </ul>
      </Card>
    );
  }
}
