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
      single: false,
      key: 'cwm-1',
      path: '/cwm/inbound',
      icon: 'icon-fontello-download',
      text: formatMsg(intl, 'inbound'),
      sublinks: [{
        key: 'cwm-1-0',
        path: '/cwm/inbound/receiving',
        text: formatMsg(intl, 'receivingNotice'),
      }, {
        key: 'cwm-1-1',
        path: '/cwm/inbound/stock',
        text: formatMsg(intl, 'inboundTransactions'),
      },
      ],
    });
    linkMenus.push({
      single: true,
      key: 'cwm-2',
      path: '/cwm/inventory',
      icon: 'icon-fontello-warehouse',
      text: formatMsg(intl, 'inventory'),
    });
    linkMenus.push({
      single: false,
      key: 'cwm-3',
      icon: 'icon-fontello-upload',
      text: formatMsg(intl, 'outbound'),
      sublinks: [{
        key: 'cwm-3-0',
        path: '/cwm/outbound/shipping',
        text: formatMsg(intl, 'shippingOrder'),
      }, {
        key: 'cwm-3-1',
        path: '/cwm/outbound',
        text: formatMsg(intl, 'outboundTransactions'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-4',
      icon: 'icon-fontello-feather',
      text: formatMsg(intl, 'ftzSupervision'),
      sublinks: [{
        key: 'cwm-4-0',
        group: '上海自贸区',
        path: '/cwm/ftz/inbound',
        text: formatMsg(intl, 'ftzInbound'),
      }, {
        key: 'cwm-4-1',
        group: '上海自贸区',
        path: '/cwm/ftz/outbound',
        text: formatMsg(intl, 'ftzOutbound'),
      }, {
        key: 'cwm-4-2',
        group: '上海自贸区',
        path: '/cwm/ftz/movement',
        text: formatMsg(intl, 'ftzMovement'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-5',
      icon: 'icon-fontello-box',
      text: formatMsg(intl, 'products'),
      sublinks: [{
        key: 'cwm-5-0',
        path: '/cwm/products/sku',
        text: formatMsg(intl, 'productsSku'),
      }, {
        key: 'cwm-5-1',
        disabled: true,
        path: '/cwm/products/lot',
        text: formatMsg(intl, 'productsLot'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-6',
      icon: 'zmdi zmdi-settings',
      text: formatMsg(intl, 'settings'),
      sublinks: [{
        key: 'cwm-6-0',
        path: '/cwm/resources',
        text: formatMsg(intl, 'resources'),
      }, {
        key: 'cwm-6-1',
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
