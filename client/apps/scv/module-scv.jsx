import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
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
      key: 'scv-0',
      path: '/scv/dashboard',
      icon: 'icon-fontello-gauge-1',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'scv-1',
      path: '/scv/orders',
      icon: 'icon-fontello-doc-text',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: false,
      key: 'scv-2',
      icon: 'zmdi zmdi-boat',
      text: formatMsg(intl, 'shipments'),
      sublinks: [{
        key: 'scv-2-0',
        path: '/scv/shipments/inbound',
        text: formatMsg(intl, 'inboundShipments'),
      }, {
        key: 'scv-2-1',
        path: '/scv/shipments/outbound',
        text: formatMsg(intl, 'outboundShipments'),
      }],
    });
    linkMenus.push({
      single: true,
      key: 'scv-3',
      path: '/scv/clearance',
      icon: 'zmdi zmdi-badge-check',
      text: formatMsg(intl, 'clearance'),
    });
    linkMenus.push({
      single: false,
      key: 'scv-4',
      icon: 'zmdi zmdi-storage',
      text: formatMsg(intl, 'inventory'),
      sublinks: [{
        key: 'scv-4-0',
        path: '/scv/inventory',
        text: formatMsg(intl, 'inventoryStatus'),
      }, {
        key: 'scv-4-1',
        path: '/scv/inventory/recieving',
        text: formatMsg(intl, 'inventoryRecieving'),
      }, {
        key: 'scv-4-2',
        path: '/scv/inventory/shipping',
        text: formatMsg(intl, 'inventoryShipping'),
      }, {
        key: 'scv-4-3',
        path: '/scv/inventory/products',
        text: formatMsg(intl, 'inventoryProducts'),
      }],
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
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
