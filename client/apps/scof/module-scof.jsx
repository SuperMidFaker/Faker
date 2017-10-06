import React from 'react';
import PropTypes from 'prop-types';
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
      key: 'scof-dashboard',
      disabled: true,
      path: '/scof/dashboard',
      icon: 'logixon icon-apps',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-order',
      path: '/scof/orders',
      icon: 'logixon icon-order-mng',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-flow',
      path: '/scof/flow',
      icon: 'logixon icon-process',
      text: formatMsg(intl, 'flow'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-customer',
      path: '/scof/customers',
      icon: 'logixon icon-customer-mng',
      text: formatMsg(intl, 'customers'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-supplier',
      disabled: true,
      path: '/scof/suppliers',
      icon: 'logixon icon-supplier-mng',
      text: formatMsg(intl, 'suppliers'),
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
