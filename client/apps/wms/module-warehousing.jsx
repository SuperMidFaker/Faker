import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleWarehousing extends React.Component {
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
      key: 'wms-0',
      path: '/warehousing/dashboard',
      icon: 'icon-fontello-gauge-1',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'wms-1',
      path: '/warehousing/inbound',
      icon: 'icon-fontello-doc-text',
      text: formatMsg(intl, 'inbound'),
    });
    linkMenus.push({
      single: true,
      key: 'wms-2',
      path: '/warehousing/outbound',
      icon: 'zmdi zmdi-globe',
      text: formatMsg(intl, 'outbound'),
    });
    linkMenus.push({
      single: true,
      key: 'wms-7',
      path: '/warehousing/settings',
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
