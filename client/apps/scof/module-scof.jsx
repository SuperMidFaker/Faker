import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { locationShape } from 'react-router';
import { loadTrackings } from 'common/reducers/sofTracking';
import Navigation from 'client/components/Navigation';
import { formatMsg } from './message.i18n';

@connect(
  state => ({
    tenantId: state.account.tenantId,
    aspect: state.account.aspect,
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
    const { sofApps, aspect } = this.props;
    const linkMenus = [];
    const appMenus = [];
    linkMenus.push({
      single: true,
      key: 'scof-dashboard',
      path: '/scof/dashboard',
      icon: 'logixon icon-dashboard-o',
      text: this.msg('dashboard'),
    });
    if (aspect === 0) {
      linkMenus.push({
        single: true,
        key: 'scof-purchaseorders',
        path: '/scof/purchaseorders',
        icon: 'logixon icon-order-mng',
        text: this.msg('purchaseOrders'),
      });
      linkMenus.push({
        single: true,
        key: 'scof-invoice',
        path: '/scof/invoices',
        icon: 'logixon icon-commercial-invoice',
        text: this.msg('invoices'),
      });
    }
    linkMenus.push({
      single: true,
      key: 'scof-shipment',
      path: '/scof/shipments',
      icon: 'logixon icon-shipment',
      text: this.msg('shipments'),
    });
    linkMenus.push({
      single: false,
      key: 'scof-tracking',
      icon: 'logixon icon-monitor',
      text: this.msg('tracking'),
      sublinks: [{
        key: 'scof-tracking-999',
        icon: 'logixon icon-install',
        path: '/scof/tracking/customize',
        text: this.msg('customizeTracking'),
      }],
    });
    linkMenus.push({
      single: true,
      key: 'scof-flow',
      path: '/scof/flow',
      icon: 'logixon icon-process',
      text: this.msg('flow'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-customer',
      path: '/scof/customers',
      icon: 'logixon icon-customer-mng',
      text: this.msg('customers'),
    });
    if (aspect === 0) {
      linkMenus.push({
        single: true,
        key: 'scof-supplier',
        path: '/scof/suppliers',
        icon: 'logixon icon-supplier',
        text: this.msg('suppliers'),
      });
    }
    linkMenus.push({
      single: true,
      key: 'scof-vendor',
      path: '/scof/vendors',
      icon: 'logixon icon-service-o',
      text: this.msg('vendors'),
    });
    linkMenus.push({
      single: true,
      bottom: true,
      key: 'scof-settings',
      path: '/scof/settings',
      icon: 'logixon icon-setting-o',
      text: this.msg('settings'),
    });
    if (sofApps.length > 0) {
      if (sofApps.length === 1) {
        appMenus.push({
          single: true,
          key: sofApps[0].app_id,
          path: sofApps[0].url,
          icon: 'logixon icon-apps',
          text: sofApps[0].app_name,
        });
      } else {
        appMenus.push({
          single: false,
          key: 'sof-app',
          icon: 'logixon icon-apps',
          text: this.msg('devApps'),
          sublinks: [],
        });
        sofApps.forEach((s, index) => {
          appMenus[0].sublinks.push({
            key: `sof-app-${index}`,
            path: s.url,
            text: s.app_name,
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
      const linkMenus = this.state.linkMenus.filter(lm => lm.key !== 'scof-tracking');
      linkMenus.splice(3, 0, {
        single: false,
        key: 'scof-tracking',
        icon: 'logixon icon-monitor',
        text: this.msg('tracking'),
        sublinks: trackingSublinks.concat([{
          key: 'scof-tracking-999',
          icon: 'logixon icon-install',
          path: '/scof/tracking/customize',
          text: this.msg('customizeTracking'),
        }]),
      });
      this.setState({ linkMenus });
    }
  }
  msg = formatMsg(this.props.intl)
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
