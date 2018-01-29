import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import { loadWhse, switchDefaultWhse } from 'common/reducers/cwmContext';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';


const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    bwmApps: state.account.apps.bwm,
  }),
  { loadWhse, switchDefaultWhse }
)
export default class ModuleCWM extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.node,
  };
  state = {
    linkMenus: [],
    appMenus: [],
  }
  componentWillMount() {
    const { intl, bwmApps } = this.props;
    const linkMenus = [];
    const appMenus = [];
    linkMenus.push({
      single: true,
      key: 'cwm-dashboard',
      path: '/cwm/dashboard',
      icon: 'logixon icon-dashboard',
      text: formatMsg(intl, 'dashboard'),
    });
    if (this.props.whse.bonded) {
      linkMenus.push({
        single: true,
        key: 'cwm-ftz',
        path: '/cwm/supervision/shftz',
        icon: 'logixon icon-ftz-supervision',
        text: formatMsg(intl, 'supervision'),
      });
    }
    linkMenus.push({
      single: false,
      key: 'cwm-receiving',
      icon: 'logixon icon-receiving',
      text: formatMsg(intl, 'receiving'),
      sublinks: [{
        key: 'cwm-receiving-0',
        path: '/cwm/receiving/asn',
        text: formatMsg(intl, 'receivingASN'),
      }, {
        key: 'cwm-receiving-1',
        path: '/cwm/receiving/inbound',
        text: formatMsg(intl, 'receivingInbound'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-stock',
      path: '/cwm/stock',
      icon: 'logixon icon-stock',
      text: formatMsg(intl, 'stock'),
      sublinks: [{
        key: 'cwm-stock-0',
        path: '/cwm/stock/inventory',
        text: formatMsg(intl, 'inventory'),
      }, {
        key: 'cwm-stock-1',
        path: '/cwm/stock/transition',
        text: formatMsg(intl, 'transition'),
      }, {
        key: 'cwm-stock-2',
        path: '/cwm/stock/movement',
        text: formatMsg(intl, 'movement'),
      }, {
        key: 'cwm-stock-3',
        path: '/cwm/stock/transactions',
        text: formatMsg(intl, 'transactions'),
      },
      ],
    });
    linkMenus.push({
      single: false,
      key: 'cwm-shipping',
      icon: 'logixon icon-shipping',
      text: formatMsg(intl, 'shipping'),
      sublinks: [{
        key: 'cwm-shipping-0',
        path: '/cwm/shipping/order',
        text: formatMsg(intl, 'shippingOrder'),
      }, {
        key: 'cwm-shipping-1',
        path: '/cwm/shipping/wave',
        text: formatMsg(intl, 'shippingWave'),
      }, {
        key: 'cwm-shipping-2',
        path: '/cwm/shipping/outbound',
        text: formatMsg(intl, 'shippingOutbound'),
      }, {
        key: 'cwm-shipping-3',
        path: '/cwm/shipping/load',
        text: formatMsg(intl, 'shippingLoad'),
      },
      ],
    });
    linkMenus.push({
      single: true,
      key: 'cwm-products',
      icon: 'logixon icon-sku',
      path: '/cwm/products/sku',
      text: formatMsg(intl, 'products'),
    });
    linkMenus.push({
      single: true,
      bottom: true,
      key: 'cwm-settings',
      path: '/cwm/settings/warehouse',
      icon: 'logixon icon-setting-o',
      text: formatMsg(intl, 'settings'),
    });
    if (bwmApps.length > 0) {
      if (bwmApps.length === 1) {
        appMenus.push({
          single: true,
          key: bwmApps[0].app_id,
          path: bwmApps[0].url,
          icon: 'logixon icon-apps',
          text: formatMsg(intl, bwmApps[0].app_name),
        });
      } else {
        appMenus.push({
          single: false,
          key: 'bwm-app',
          icon: 'logixon icon-apps',
          text: formatMsg(intl, 'devApps'),
          sublinks: [],
        });
        bwmApps.forEach((b, index) => {
          appMenus[0].sublinks.push({
            key: `bwm-app-${index}`,
            path: b.url,
            text: formatMsg(intl, b.app_name),
          });
        });
      }
    }
    this.setState({ linkMenus, appMenus });
    if (!this.props.whse.code && typeof window !== 'undefined') {
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
      const linkMenus = this.state.linkMenus.filter(lm => lm.key !== 'cwm-ftz');
      if (nextProps.whse.bonded) {
        linkMenus.splice(1, 0, {
          single: true,
          key: 'cwm-ftz',
          path: '/cwm/supervision/shftz',
          icon: 'logixon icon-ftz-supervision',
          text: formatMsg(nextProps.intl, 'supervision'),
        });
      }
      this.setState({ linkMenus });
    }
  }
  render() {
    return (
      <CollapsibleSiderLayout
        links={this.state.linkMenus}
        appMenus={this.state.appMenus}
        childContent={this.props.children}
        location={this.props.location}
      />
    );
  }
}
