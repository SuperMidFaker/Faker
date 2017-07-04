import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import { loadWhse, switchDefaultWhse } from 'common/reducers/cwmContext';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
  }),
  { loadWhse, switchDefaultWhse }
)
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
      icon: 'logixon icon-chaibaoguoqujian',
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
      icon: 'logixon icon-peizaizhuangche',
      text: formatMsg(intl, 'shipping'),
      sublinks: [{
        key: 'cwm-2-0',
        path: '/cwm/shipping/order',
        text: formatMsg(intl, 'shippingOrder'),
      }, {
        key: 'cwm-2-1',
        path: '/cwm/shipping/wave',
        text: formatMsg(intl, 'shippingWave'),
      }, {
        key: 'cwm-2-2',
        path: '/cwm/shipping/outbound',
        text: formatMsg(intl, 'shippingOutbound'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-3',
      path: '/cwm/stock',
      icon: 'logixon icon-kucun',
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
        path: '/cwm/stock/replenishment',
        text: formatMsg(intl, 'replenishment'),
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
      icon: 'logixon icon-haiguan',
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
      icon: 'logixon icon-tijikongjian',
      text: formatMsg(intl, 'products'),
      sublinks: [{
        key: 'cwm-5-0',
        path: '/cwm/products/sku',
        text: formatMsg(intl, 'productsSku'),
      }, {
        key: 'cwm-5-3',
        disabled: true,
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
        path: '/cwm/settings/templates',
        text: formatMsg(intl, 'templates'),
      }],
    });
    this.setState({ linkMenus });
  }
  componentDidMount() {
    let defaultWhse = this.props.whses.length > 0 ? this.props.whses[0].code : null;
    if (window.localStorage) {
      const contextWhse = window.localStorage.getItem('whse-code');
      if (contextWhse === null) {
        window.localStorage.setItem('whse-code', defaultWhse);
      } else {
        defaultWhse = contextWhse;
      }
    }
    this.props.switchDefaultWhse(defaultWhse);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whse.code !== this.props.whse.code) {
      if (window.localStorage) {
        const contextWhse = window.localStorage.getItem('whse-code');
        if (contextWhse !== nextProps.whse.code) {
          window.localStorage.setItem('whse-code', nextProps.whse.code);
        }
      }
      nextProps.loadWhse(nextProps.whse.code);
    }
  }
  render() {
    return (
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
