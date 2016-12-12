import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapseSideLayout from 'client/components/collapseSideLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleCRM extends React.Component {
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
      key: 'customer-1',
      path: '/customer/dashboard',
      icon: 'icon-fontello-gauge',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'customer-2',
      path: '/customer/orders',
      icon: 'icon-fontello-doc-text',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: false,
      key: 'customer-3',
      path: '/customer/billing',
      icon: 'zmdi zmdi-money-box',
      text: formatMsg(intl, 'billing'),
      sublinks: [{
        key: 'tms-3-0',
        path: '/customer/billing/fees',
        text: '费用管理',
      }, {
        key: 'tms-3-1',
        path: '/customer/billing/list',
        text: '账单管理',
      }],
    });
    linkMenus.push({
      single: true,
      key: 'customer-4',
      path: '/customer/customers',
      icon: 'zmdi zmdi-accounts-list',
      text: formatMsg(intl, 'customers'),
    });
    linkMenus.push({
      single: true,
      key: 'customer-5',
      path: '/customer/reports',
      icon: 'zmdi zmdi-chart',
      text: formatMsg(intl, 'reports'),
    });
    linkMenus.push({
      single: true,
      key: 'customer-6',
      path: '/customer/settings',
      icon: 'zmdi zmdi-settings',
      text: formatMsg(intl, 'settings'),
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <CollapseSideLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
