import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    bssApps: state.account.apps.bss,
  }),
  {}
)
export default class ModuleBMS extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.node,
  };
  state = {
    linkMenus: [],
    appMenus: [],
  }
  componentWillMount() {
    const { intl, bssApps } = this.props;
    const linkMenus = [];
    const appMenus = [];
    linkMenus.push({
      single: true,
      key: 'bss-0',
      disabled: false,
      path: '/bss/dashboard',
      icon: 'logixon icon-apps',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: false,
      key: 'bss-fee',
      icon: 'logixon icon-finance-o',
      text: formatMsg(intl, 'fee'),
      sublinks: [{
        key: 'bss-fee-0',
        path: '/bss/fee/summary',
        text: formatMsg(intl, 'feeSummary'),
      }, {
        key: 'bss-fee-1',
        path: '/bss/fee/statement',
        text: formatMsg(intl, 'feeStatement'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'bss-revenue',
      icon: 'logixon icon-receivable',
      text: formatMsg(intl, 'revenue'),
      sublinks: [{
        key: 'bss-revenue-0',
        path: '/bss/receivable/bill',
        text: formatMsg(intl, 'customerBill'),
      }, {
        key: 'bss-revenue-1',
        path: '/bss/receivable/invoice',
        text: formatMsg(intl, 'receivableInvoice'),
      }, {
        key: 'bss-revenue-2',
        path: '/bss/receivable/payment',
        text: formatMsg(intl, 'paymentReceived'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'bss-cost',
      icon: 'logixon icon-payable',
      text: formatMsg(intl, 'cost'),
      sublinks: [{
        key: 'bss-cost-0',
        path: '/bss/payable/bill',
        text: formatMsg(intl, 'vendorBill'),
      }, {
        key: 'bss-cost-1',
        path: '/bss/payable/invoice',
        text: formatMsg(intl, 'payableInvoice'),
      }, {
        key: 'bss-cost-2',
        path: '/bss/payable/payment',
        text: formatMsg(intl, 'paymentMade'),
      }],
    });
    linkMenus.push({
      single: true,
      bottom: true,
      key: 'bss-settings',
      path: '/bss/settings',
      icon: 'logixon icon-setting-o',
      text: formatMsg(intl, 'settings'),
    });
    if (bssApps.length > 0) {
      if (bssApps.length === 1) {
        appMenus.push({
          single: true,
          key: bssApps[0].app_id,
          path: bssApps[0].url,
          icon: 'logixon icon-apps',
          text: formatMsg(intl, bssApps[0].app_name),
        });
      } else {
        appMenus.push({
          single: false,
          key: 'bss-app',
          icon: 'logixon icon-apps',
          text: formatMsg(intl, 'devApps'),
          sublinks: [],
        });
        bssApps.forEach((b, index) => {
          appMenus[0].sublinks.push({
            key: `bss-app-${index}`,
            path: b.url,
            text: formatMsg(intl, b.app_name),
          });
        });
      }
    }
    this.setState({ linkMenus, appMenus });
  }
  render() {
    return (
      <CollapsibleSiderLayout
        links={this.state.linkMenus}
        appMenus={this.state.appMenus}
        childContent={this.props.children}
        location={this.props.location}
      />
    );
  }
}
