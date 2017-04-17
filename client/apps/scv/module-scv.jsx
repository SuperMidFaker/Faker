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
      icon: 'icon-fontello-gauge',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: false,
      key: 'scv-2',
      icon: 'icon-fontello-tasks-1',
      text: formatMsg(intl, 'tracking'),
      sublinks: [{
        key: 'scv-2-0',
        path: '/scv/shipments/inbound',
        text: formatMsg(intl, 'inboundShipments'),
      }, {
        key: 'scv-2-1',
        disabled: true,
        path: '/scv/shipments/outbound',
        text: formatMsg(intl, 'outboundShipments'),
      }, {
        key: 'scv-2-99',
        icon: 'zmdi zmdi-wrench',
        path: '/scv/tracking/customize',
        text: formatMsg(intl, 'customizeTracking'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-3',
      icon: 'zmdi zmdi-badge-check',
      text: formatMsg(intl, 'clearance'),
      sublinks: [{
        key: 'scv-3-0',
        icon: 'anticon anticon-file-text',
        path: '/scv/clearance/manifest',
        text: formatMsg(intl, 'clearanceManifest'),
      }, {
        key: 'scv-3-1',
        path: '/scv/clearance/decl',
        icon: 'anticon anticon-file',
        text: formatMsg(intl, 'clearanceDecl'),
      }, {
        key: 'scv-3-2',
        disabled: true,
        path: '/scv/clearance/tax',
        icon: 'anticon anticon-bank',
        text: formatMsg(intl, 'clearanceTax'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-4',
      icon: 'icon-fontello-database',
      text: formatMsg(intl, 'products'),
      sublinks: [{
        key: 'scv-4-0',
        path: '/scv/products/tradeitem',
        text: formatMsg(intl, 'productsTradeItem'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-5',
      icon: 'icon-fontello-warehouse',
      text: formatMsg(intl, 'inventory'),
      sublinks: [{
        key: 'scv-5-0',
        path: '/scv/inventory/stock',
        text: formatMsg(intl, 'inventoryStock'),
      }, {
        key: 'scv-5-1',
        path: '/scv/inventory/transaction',
        text: formatMsg(intl, 'inventoryTransaction'),
      }, {
        key: 'scv-5-2',
        path: '/scv/inventory/receiving',
        text: formatMsg(intl, 'inventoryReceiving'),
      }, {
        key: 'scv-5-3',
        path: '/scv/inventory/shipping',
        text: formatMsg(intl, 'inventoryShipping'),
      }, {
        key: 'scv-5-4',
        path: '/scv/inventory/sku',
        text: formatMsg(intl, 'inventorySKU'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-6',
      disabled: true,
      icon: 'icon-fontello-money-1',
      text: formatMsg(intl, 'billing'),
      sublinks: [{
        key: 'scv-6-0',
        path: '/scv/billing/expenses',
        text: formatMsg(intl, 'billingExpenses'),
      }, {
        key: 'scv-6-1',
        path: '/scv/billing/statements',
        text: formatMsg(intl, 'billingStatements'),
      }, {
        key: 'scv-6-2',
        path: '/scv/billing/Quotes',
        text: formatMsg(intl, 'billingQuotes'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-7',
      disabled: true,
      icon: 'icon-ikons-bar-chart-2',
      text: formatMsg(intl, 'analytics'),
      sublinks: [{
        key: 'scv-7-0',
        path: '/scv/analytics/kpi',
        text: formatMsg(intl, 'kpiAnalytics'),
      }, {
        key: 'scv-7-1',
        path: '/scv/analytics/cost',
        text: formatMsg(intl, 'costAnalytics'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-8',
      icon: 'zmdi zmdi-settings',
      text: formatMsg(intl, 'settings'),
      sublinks: [{
        key: 'scv-8-0',
        path: '/scv/resources',
        text: formatMsg(intl, 'resources'),
      }, {
        key: 'scv-8-2',
        path: '/scv/classification',
        text: formatMsg(intl, 'classifyTradeItem'),
      }, {
        key: 'scv-8-1',
        disabled: true,
        path: '/scv/settings',
        text: formatMsg(intl, 'settingsApp'),
      }],
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
