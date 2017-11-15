import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleBMS extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.node,
  };
  state = {
    linkMenus: [],
  }
  componentWillMount() {
    const { intl } = this.props;
    const linkMenus = [];
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
      key: 'bss-settings',
      path: '/bss/settings',
      icon: 'logixon icon-setting-o',
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
