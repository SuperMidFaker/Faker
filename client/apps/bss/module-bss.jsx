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
      disabled: true,
      path: '/bss/dashboard',
      icon: 'logixon icon-apps',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'bss-settlement',
      path: '/bss/settlement',
      icon: 'logixon icon-bill',
      text: formatMsg(intl, 'settlement'),
    });
    linkMenus.push({
      single: false,
      key: 'bss-receivable',
      icon: 'logixon icon-finance-o',
      text: formatMsg(intl, 'receivable'),
      sublinks: [{
        key: 'bss-receivable-0',
        path: '/bss/receivable/bill',
        text: formatMsg(intl, 'receivableBill'),
      }, {
        key: 'bss-receivable-1',
        path: '/bss/receivable/invoice',
        text: formatMsg(intl, 'receivableInvoice'),
      }, {
        key: 'bss-receivable-2',
        path: '/bss/receivable/payment',
        text: formatMsg(intl, 'paymentReceived'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'bss-payable',
      icon: 'logixon icon-refund',
      text: formatMsg(intl, 'payable'),
      sublinks: [{
        key: 'bss-payable-0',
        path: '/bss/payable/bill',
        text: formatMsg(intl, 'payableBill'),
      }, {
        key: 'bss-payable-1',
        path: '/bss/payable/invoice',
        text: formatMsg(intl, 'payableInvoice'),
      }, {
        key: 'bss-payable-2',
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
