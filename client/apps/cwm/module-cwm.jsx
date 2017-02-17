import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleCWM extends React.Component {
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
      key: 'cwm-0',
      path: '/cwm/dashboard',
      icon: 'icon-fontello-gauge',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'cwm-1',
      disabled: true,
      path: '/cwm/inbound',
      icon: 'icon-fontello-download',
      text: formatMsg(intl, 'inbound'),
    });
    linkMenus.push({
      single: true,
      key: 'cwm-2',
      path: '/cwm/inventory',
      icon: 'icon-fontello-warehouse',
      text: formatMsg(intl, 'inventory'),
    });
    linkMenus.push({
      single: true,
      key: 'cwm-3',
      path: '/cwm/outbound',
      icon: 'icon-fontello-upload',
      text: formatMsg(intl, 'outbound'),
    });
    linkMenus.push({
      single: false,
      key: 'cwm-4',
      icon: 'icon-fontello-box',
      text: formatMsg(intl, 'products'),
      sublinks: [{
        key: 'cwm-4-0',
        path: '/cwm/products/sku',
        text: formatMsg(intl, 'productsSku'),
      }, {
        key: 'cwm-4-1',
        path: '/cwm/products/lot',
        text: formatMsg(intl, 'productsLot'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-5',
      icon: 'zmdi zmdi-settings',
      text: formatMsg(intl, 'settings'),
      sublinks: [{
        key: 'cwm-5-0',
        path: '/cwm/resources',
        text: formatMsg(intl, 'resources'),
      }, {
        key: 'cwm-5-1',
        disabled: true,
        path: '/cwm/settings',
        text: formatMsg(intl, 'settingsApp'),
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
