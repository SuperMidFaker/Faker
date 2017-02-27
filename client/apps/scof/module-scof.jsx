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
      key: 'crm-0',
      disabled: true,
      path: '/scof/dashboard',
      icon: 'icon-fontello-gauge',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'crm-1',
      path: '/scof/customers',
      icon: 'zmdi zmdi-accounts-list',
      text: formatMsg(intl, 'customers'),
    });
    linkMenus.push({
      single: true,
      key: 'crm-2',
      path: '/scof/orders',
      icon: 'icon-fontello-doc-text',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: true,
      key: 'crm-3',
      path: '/scof/flow',
      icon: 'icon-fontello-flow-tree',
      text: formatMsg(intl, 'flow'),
    });
    linkMenus.push({
      single: false,
      key: 'crm-4',
      path: '/scof/billing',
      icon: 'icon-fontello-money-1',
      text: formatMsg(intl, 'billing'),
      sublinks: [{
        key: 'crm-4-0',
        path: '/scof/billing/fees',
        text: '费用管理',
      }, {
        key: 'crm-4-1',
        path: '/scof/billing/list',
        text: '账单管理',
      }],
    });
    linkMenus.push({
      single: true,
      key: 'crm-5',
      disabled: true,
      path: '/scof/reports',
      icon: 'icon-ikons-bar-chart-2',
      text: formatMsg(intl, 'reports'),
    });
    linkMenus.push({
      single: true,
      key: 'crm-6',
      disabled: true,
      path: '/scof/settings',
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
