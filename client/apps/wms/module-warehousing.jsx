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
      icon: 'zmdi zmdi-desktop-windows',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'wms-1',
      path: '/warehousing/inbound',
      icon: 'icon-fontello-download',
      text: formatMsg(intl, 'inbound'),
    });
    linkMenus.push({
      single: true,
      key: 'wms-2',
      path: '/warehousing/outbound',
      icon: 'icon-fontello-upload',
      text: formatMsg(intl, 'outbound'),
    });
    linkMenus.push({
      single: true,
      key: 'wms-3',
      path: '/warehousing/inventory',
      icon: 'icon-fontello-warehouse',
      text: formatMsg(intl, 'inventory'),
    });
    linkMenus.push({
      single: false,
      key: 'wms-4',
      icon: 'icon-fontello-layers',
      text: formatMsg(intl, 'products'),
      sublinks: [{
        key: 'wms-4-0',
        path: '/products/tradeitem',
        text: formatMsg(intl, 'productsTradeItem'),
      }, {
        key: 'wms-4-1',
        path: '/products/sku',
        text: formatMsg(intl, 'productsSKU'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'wms-6',
      icon: 'zmdi zmdi-library',
      text: formatMsg(intl, 'resources'),
      sublinks: [{
        key: 'wms-6-0',
        path: '/warehousing/resources/warehouse',
        text: formatMsg(intl, 'resourcesWarehouse'),
      }, {
        key: 'wms-6-1',
        path: '/warehousing/resources/owner',
        text: formatMsg(intl, 'resourcesOwner'),
      }, {
        key: 'wms-6-2',
        path: '/warehousing/resources/supplier',
        text: formatMsg(intl, 'resourcesSupplier'),
      }, {
        key: 'wms-6-3',
        path: '/warehousing/resources/consignee',
        text: formatMsg(intl, 'resourcesConsignee'),
      }],
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
