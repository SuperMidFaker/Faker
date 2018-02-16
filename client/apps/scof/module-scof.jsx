import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { locationShape } from 'react-router';
import { loadTrackings } from 'common/reducers/sofTracking';
import { format } from 'client/common/i18n/helpers';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';

const formatMsg = format(messages);

@connect(
  state => ({
    tenantId: state.account.tenantId,
    privileges: state.account.privileges,
    trackings: state.sofTracking.trackings,
    sofApps: state.account.apps.sof,
  }),
  { loadTrackings }
)
@injectIntl
export default class ModuleSCOF extends React.Component {
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
    this.props.loadTrackings(this.props.tenantId);
    const { intl, sofApps } = this.props;
    const linkMenus = [];
    const appMenus = [];
    linkMenus.push({
      single: true,
      key: 'scof-dashboard',
      path: '/scof/dashboard',
      icon: 'logixon icon-dashboard-o',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-order',
      path: '/scof/orders',
      icon: 'logixon icon-order-mng',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-invoice',
      path: '/scof/invoices',
      icon: 'logixon icon-invoice',
      text: formatMsg(intl, 'invoices'),
    });
    linkMenus.push({
      single: false,
      key: 'scof-tracking',
      icon: 'logixon icon-monitor',
      text: formatMsg(intl, 'tracking'),
      sublinks: [{
        key: 'scof-tracking-999',
        icon: 'logixon icon-install',
        path: '/scof/tracking/customize',
        text: formatMsg(intl, 'customizeTracking'),
      }],
    });
    linkMenus.push({
      single: true,
      key: 'scof-flow',
      path: '/scof/flow',
      icon: 'logixon icon-process',
      text: formatMsg(intl, 'flow'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-customer',
      path: '/scof/customers',
      icon: 'logixon icon-customer-mng',
      text: formatMsg(intl, 'customers'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-vendor',
      path: '/scof/vendors',
      icon: 'logixon icon-supplier-mng',
      text: formatMsg(intl, 'vendors'),
    });
    linkMenus.push({
      single: true,
      bottom: true,
      key: 'scof-settings',
      path: '/scof/settings',
      icon: 'logixon icon-setting-o',
      text: formatMsg(intl, 'settings'),
    });
    if (sofApps.length > 0) {
      if (sofApps.length === 1) {
        appMenus.push({
          single: true,
          key: sofApps[0].app_id,
          path: sofApps[0].url,
          icon: 'logixon icon-apps',
          text: formatMsg(intl, sofApps[0].app_name),
        });
      } else {
        appMenus.push({
          single: false,
          key: 'sof-app',
          icon: 'logixon icon-apps',
          text: formatMsg(intl, 'devApps'),
          sublinks: [],
        });
        sofApps.forEach((s, index) => {
          appMenus[0].sublinks.push({
            key: `sof-app-${index}`,
            path: s.url,
            text: formatMsg(intl, s.app_name),
          });
        });
      }
    }
    this.setState({ linkMenus, appMenus });
  }
  componentWillReceiveProps(nextProps) {
    let trackingSublinks = [];
    if (nextProps.trackings.length > 0) {
      trackingSublinks = nextProps.trackings.map((item, index) => ({
        key: `scof-tracking-${index}`,
        path: `/scof/tracking/${item.id}`,
        text: item.name,
      }));
    }
    if (trackingSublinks.length > 0) {
      const { intl } = this.props;
      const linkMenus = this.state.linkMenus.filter(lm => lm.key !== 'scof-tracking');
      linkMenus.splice(3, 0, {
        single: false,
        key: 'scof-tracking',
        icon: 'logixon icon-monitor',
        text: formatMsg(intl, 'tracking'),
        sublinks: trackingSublinks.concat([{
          key: 'scof-tracking-999',
          icon: 'logixon icon-install',
          path: '/scof/tracking/customize',
          text: formatMsg(intl, 'customizeTracking'),
        }]),
      });
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
