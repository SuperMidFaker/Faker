import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleWCM extends React.Component {
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
      key: 'wcm-0',
      path: '/wcm/dashboard',
      icon: 'zmdi zmdi-desktop-windows',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'wcm-1',
      path: '/wcm/inbound',
      icon: 'icon-fontello-download',
      text: formatMsg(intl, 'inbound'),
    });
    linkMenus.push({
      single: true,
      key: 'wcm-2',
      path: '/wcm/outbound',
      icon: 'icon-fontello-upload',
      text: formatMsg(intl, 'outbound'),
    });
    linkMenus.push({
      single: true,
      key: 'wcm-3',
      path: '/wcm/inventory',
      icon: 'icon-fontello-warehouse',
      text: formatMsg(intl, 'inventory'),
    });
    linkMenus.push({
      single: false,
      key: 'wcm-4',
      icon: 'icon-fontello-layers',
      text: formatMsg(intl, 'products'),
      sublinks: [{
        key: 'wcm-4-0',
        path: '/products/tradeitem',
        text: formatMsg(intl, 'productsTradeItem'),
      }, {
        key: 'wcm-4-1',
        path: '/products/sku',
        text: formatMsg(intl, 'productsSKU'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'wcm-6',
      icon: 'zmdi zmdi-library',
      text: formatMsg(intl, 'resources'),
      sublinks: [{
        key: 'wcm-6-0',
        path: '/wcm/resources/warehouse',
        text: formatMsg(intl, 'resourcesWarehouse'),
      }, {
        key: 'wcm-6-1',
        path: '/wcm/resources/owner',
        text: formatMsg(intl, 'resourcesOwner'),
      }, {
        key: 'wcm-6-2',
        path: '/wcm/resources/supplier',
        text: formatMsg(intl, 'resourcesSupplier'),
      }, {
        key: 'wcm-6-3',
        path: '/wcm/resources/consignee',
        text: formatMsg(intl, 'resourcesConsignee'),
      }],
    });
    linkMenus.push({
      single: true,
      key: 'wcm-7',
      path: '/wcm/settings',
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
