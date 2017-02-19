import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleCRM extends React.Component {
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
      key: 'crm-1',
      path: '/scop/dashboard',
      icon: 'icon-fontello-gauge',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'crm-2',
      path: '/scop/orders',
      icon: 'icon-fontello-doc-text',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: false,
      key: 'crm-3',
      path: '/scop/billing',
      icon: 'icon-fontello-money-1',
      text: formatMsg(intl, 'billing'),
      sublinks: [{
        key: 'crm-3-0',
        path: '/scop/billing/fees',
        text: '费用管理',
      }, {
        key: 'crm-3-1',
        path: '/scop/billing/list',
        text: '账单管理',
      }],
    });
    linkMenus.push({
      single: true,
      key: 'crm-4',
      path: '/scop/customers',
      icon: 'zmdi zmdi-accounts-list',
      text: formatMsg(intl, 'customers'),
    });
    linkMenus.push({
      single: true,
      key: 'crm-5',
      path: '/scop/reports',
      icon: 'icon-ikons-bar-chart-2',
      text: formatMsg(intl, 'reports'),
    });
    linkMenus.push({
      single: true,
      key: 'crm-6',
      path: '/scop/settings',
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
