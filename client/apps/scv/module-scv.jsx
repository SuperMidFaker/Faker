import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleSCV extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.object.isRequired,
  };
  state = {
    linkMenus: [],
  }
  componentWillMount() {
    const { intl } = this.props;
    const linkMenus = [];
    linkMenus.push({
      single: true,
      key: 'scv-1',
      path: '/scv/dashboard',
      icon: 'icon-fontello-gauge-1',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'scv-2',
      path: '/scv/orders',
      icon: 'icon-fontello-doc-text',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: true,
      key: 'scv-3',
      path: '/scv/inbound',
      icon: 'icon-ikons-login',
      text: formatMsg(intl, 'inboundShipments'),
    });
    linkMenus.push({
      single: true,
      key: 'scv-4',
      path: '/scv/outbound',
      icon: 'icon-ikons-logout',
      text: formatMsg(intl, 'outboundShipments'),
    });
    linkMenus.push({
      single: false,
      key: 'scv-5',
      icon: 'zmdi zmdi-money-box',
      text: formatMsg(intl, 'payment'),
      sublinks: [{
        key: 'scv-5-0',
        path: '/scv/payments/tax',
        text: formatMsg(intl, 'taxPayment'),
      }, {
        key: 'scv-5-1',
        path: '/scv/payments/billing',
        text: formatMsg(intl, 'billingPayment'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-6',
      icon: 'icon-ikons-bar-chart-2',
      text: formatMsg(intl, 'analytics'),
      sublinks: [{
        key: 'scv-6-0',
        path: '/scv/analytics/kpi',
        text: formatMsg(intl, 'kpiAnalytics'),
      }, {
        key: 'scv-6-1',
        path: '/scv/analytics/cost',
        text: formatMsg(intl, 'costAnalytics'),
      }],
    });
    linkMenus.push({
      single: true,
      key: 'scv-7',
      path: '/scv/settings',
      icon: 'zmdi zmdi-settings',
      text: formatMsg(intl, 'settings'),
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <div className="am-content">
        <AmLeftSidebar links={this.state.linkMenus} location={this.props.location} />
        {this.props.children}
      </div>
    );
  }
}
