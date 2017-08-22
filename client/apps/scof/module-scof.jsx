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
      key: 'scof-0',
      disabled: true,
      path: '/scof/dashboard',
      icon: 'logixon icon-apps',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-1',
      path: '/scof/orders',
      icon: 'logixon icon-tasks',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-2',
      path: '/scof/billing',
      icon: 'logixon icon-bill',
      text: formatMsg(intl, 'billing'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-4',
      path: '/scof/customers',
      icon: 'logixon icon-partner',
      text: formatMsg(intl, 'customers'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-3',
      path: '/scof/flow',
      icon: 'logixon icon-flow',
      text: formatMsg(intl, 'flow'),
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
