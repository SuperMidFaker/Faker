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
      icon: 'zmdi zmdi-desktop-windows',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'cwm-1',
      path: '/cwm/inbound',
      icon: 'icon-fontello-download',
      text: formatMsg(intl, 'inbound'),
    });
    linkMenus.push({
      single: true,
      key: 'cwm-2',
      path: '/cwm/outbound',
      icon: 'icon-fontello-upload',
      text: formatMsg(intl, 'outbound'),
    });
    linkMenus.push({
      single: true,
      key: 'cwm-3',
      path: '/cwm/inventory',
      icon: 'icon-fontello-warehouse',
      text: formatMsg(intl, 'inventory'),
    });
    linkMenus.push({
      single: false,
      key: 'cwm-4',
      icon: 'icon-fontello-layers',
      text: formatMsg(intl, 'products'),
      sublinks: [{
        key: 'cwm-4-0',
        path: '/cwm/products/sku',
        text: formatMsg(intl, 'productsSKU'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-6',
      icon: 'zmdi zmdi-library',
      text: formatMsg(intl, 'resources'),
      sublinks: [{
        key: 'cwm-6-0',
        path: '/cwm/resources/warehouse',
        text: formatMsg(intl, 'resourcesWarehouse'),
      }, {
        key: 'cwm-6-1',
        path: '/cwm/resources/owner',
        text: formatMsg(intl, 'resourcesOwner'),
      }, {
        key: 'cwm-6-2',
        path: '/cwm/resources/supplier',
        text: formatMsg(intl, 'resourcesSupplier'),
      }, {
        key: 'cwm-6-3',
        path: '/cwm/resources/consignee',
        text: formatMsg(intl, 'resourcesConsignee'),
      }],
    });
    linkMenus.push({
      single: true,
      key: 'cwm-7',
      path: '/cwm/settings',
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
