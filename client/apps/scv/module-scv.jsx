import React from 'react';
import PropTypes from 'prop-types';
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
      key: 'scv-3',
      icon: 'logixon icon-customs-o',
      text: formatMsg(intl, 'clearance'),
      sublinks: [{
        key: 'scv-3-0',
        path: '/scv/clearance/manifest',
        text: formatMsg(intl, 'clearanceManifest'),
      }, {
        key: 'scv-3-1',
        path: '/scv/clearance/decl',
        text: formatMsg(intl, 'customsDecl'),
      }, {
        key: 'scv-3-2',
        disabled: true,
        path: '/scv/clearance/tax',
        text: formatMsg(intl, 'ciqDecl'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-4',
      icon: 'logixon icon-resource-o',
      text: formatMsg(intl, 'compliance'),
      sublinks: [{
        key: 'scv-4-0',
        path: '/scv/compliance/classification',
        text: formatMsg(intl, 'tradeItem'),
      }, {
        key: 'scv-4-1',
        path: '/scv/compliance/permit',
        text: formatMsg(intl, 'certPermit'),
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
