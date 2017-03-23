import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleSCOF extends React.Component {
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
      key: 'scof-0',
      disabled: true,
      path: '/scof/dashboard',
      icon: 'icon-fontello-gauge',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-1',
      path: '/scof/orders',
      icon: 'icon-fontello-doc-text',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: false,
      key: 'scof-2',
      path: '/scof/billing',
      icon: 'icon-fontello-money-1',
      text: formatMsg(intl, 'billing'),
      sublinks: [{
        key: 'scof-2-0',
        path: '/scof/billing/fees',
        text: '费用管理',
      }, {
        key: 'scof-2-1',
        path: '/scof/billing/list',
        text: '账单管理',
      }],
    });
    linkMenus.push({
      single: true,
      key: 'scof-3',
      path: '/scof/flow',
      icon: 'icon-fontello-flow-tree',
      text: formatMsg(intl, 'flow'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-4',
      path: '/scof/customers',
      icon: 'zmdi zmdi-accounts-list',
      text: formatMsg(intl, 'customers'),
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
