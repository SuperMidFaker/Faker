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
      icon: 'icon-fontello-download',
      text: formatMsg(intl, 'receiving'),
      sublinks: [{
        key: 'cwm-1-0',
        path: '/cwm/receiving/asn',
        text: formatMsg(intl, 'receivingASN'),
      }, {
        key: 'cwm-1-1',
        path: '/cwm/receiving/inbound',
        text: formatMsg(intl, 'receivingInbound'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-2',
      icon: 'icon-fontello-upload',
      text: formatMsg(intl, 'shipping'),
      sublinks: [{
        key: 'cwm-2-0',
        path: '/cwm/shipping/order',
        text: formatMsg(intl, 'shippingOrder'),
      }, {
        key: 'cwm-2-1',
        path: '/cwm/shipping/outbound',
        text: formatMsg(intl, 'shippingOutbound'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-3',
      path: '/cwm/stock',
      icon: 'icon-fontello-warehouse',
      text: formatMsg(intl, 'stock'),
      sublinks: [{
        key: 'cwm-3-0',
        path: '/cwm/stock/inventory',
        text: formatMsg(intl, 'inventory'),
      }, {
        key: 'cwm-3-1',
        disabled: true,
        path: '/cwm/stock/movement',
        text: formatMsg(intl, 'movement'),
      }, {
        key: 'cwm-3-2',
        disabled: true,
        path: '/cwm/stock/replishment',
        text: formatMsg(intl, 'replishment'),
      }, {
        key: 'cwm-3-3',
        disabled: true,
        path: '/cwm/stock/counting',
        text: formatMsg(intl, 'counting'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-4',
      icon: 'icon-fontello-feather',
      text: formatMsg(intl, 'supervision'),
      sublinks: [{
        key: 'cwm-4-0',
        path: '/cwm/supervision/shftz',
        text: formatMsg(intl, 'supervisionSHFTZ'),
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
        key: 'cwm-5-2',
        path: '/cwm/products/mapping',
        text: formatMsg(intl, 'productsMapping'),
      }, {
        key: 'cwm-5-3',
        path: '/cwm/products/lotting',
        text: formatMsg(intl, 'productsLotting'),
      }, {
        key: 'cwm-5-4',
        disabled: true,
        path: '/cwm/products/kitting',
        text: formatMsg(intl, 'productsKitting'),
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
        path: '/cwm/settings/warehouse',
        text: formatMsg(intl, 'warehouse'),
      }, {
        key: 'cwm-6-1',
        path: '/cwm/settings/rules',
        text: formatMsg(intl, 'rules'),
      }, {
        key: 'cwm-6-2',
        path: '/cwm/settings/tools',
        text: formatMsg(intl, 'tools'),
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
