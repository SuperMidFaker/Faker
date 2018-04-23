import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import Navigation from 'client/components/Navigation';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    bssApps: state.account.apps.bss,
  }),
  {}
)
export default class ModuleBSS extends React.Component {
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
    const { intl, bssApps } = this.props;
    const linkMenus = [];
    const appMenus = [];
    linkMenus.push({
      single: true,
      key: 'bss-0',
      disabled: false,
      path: '/bss/dashboard',
      icon: 'logixon icon-dashboard',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'bss-audit',
      icon: 'logixon icon-expense-audit',
      text: formatMsg(intl, 'audit'),
      path: '/bss/audit',
    });
    linkMenus.push({
      single: true,
      key: 'bss-bill',
      icon: 'logixon icon-bill',
      text: formatMsg(intl, 'bill'),
      path: '/bss/bill',
    });
    linkMenus.push({
      single: true,
      key: 'bss-invoice',
      icon: 'logixon icon-invoice',
      text: formatMsg(intl, 'invoice'),
      path: '/bss/invoice',
    });
    linkMenus.push({
      single: true,
      key: 'bss-voucher',
      icon: 'logixon icon-voucher',
      text: formatMsg(intl, 'voucher'),
      path: '/bss/voucher',
    });
    linkMenus.push({
      single: true,
      bottom: true,
      key: 'bss-settings',
      path: '/bss/settings',
      icon: 'logixon icon-setting-o',
      text: formatMsg(intl, 'settings'),
    });
    if (bssApps.length > 0) {
      if (bssApps.length === 1) {
        appMenus.push({
          single: true,
          key: bssApps[0].app_id,
          path: bssApps[0].url,
          icon: 'logixon icon-apps',
          text: formatMsg(intl, bssApps[0].app_name),
        });
      } else {
        appMenus.push({
          single: false,
          key: 'bss-app',
          icon: 'logixon icon-apps',
          text: formatMsg(intl, 'devApps'),
          sublinks: [],
        });
        bssApps.forEach((b, index) => {
          appMenus[0].sublinks.push({
            key: `bss-app-${index}`,
            path: b.url,
            text: formatMsg(intl, b.app_name),
          });
        });
      }
    }
    this.setState({ linkMenus, appMenus });
  }
  render() {
    return (
      <Navigation
        links={this.state.linkMenus}
        appMenus={this.state.appMenus}
        childContent={this.props.children}
        location={this.props.location}
      />
    );
  }
}
