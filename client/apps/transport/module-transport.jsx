import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    privileges: state.account.privileges,
  })
)
export default class Transport extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    privileges: PropTypes.object.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.node,
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  state = {
    linkMenus: [],
  }
  componentWillMount() {
    const { privileges, intl } = this.props;
    const linkMenus = [];
    if (hasPermission(privileges, { module: 'transport', feature: 'dashboard' })) {
      linkMenus.push({
        single: true,
        key: 'tms-0',
        path: '/transport/dashboard',
        icon: 'logixon icon-apps',
        text: formatMsg(intl, 'dashboard'),
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'shipment' })) {
      linkMenus.push({
        single: true,
        key: 'tms-1',
        path: '/transport/shipment',
        icon: 'logixon icon-order',
        text: formatMsg(intl, 'shipment'),
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'dispatch' })) {
      linkMenus.push({
        single: true,
        key: 'tms-2',
        path: '/transport/dispatch',
        icon: 'logixon icon-truck',
        text: formatMsg(intl, 'dispatch'),
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'tracking' })) {
      linkMenus.push({
        single: true,
        key: 'tms-3',
        path: '/transport/tracking',
        icon: 'logixon icon-tracking',
        text: formatMsg(intl, 'tracking'),
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'billing' })) {
      linkMenus.push({
        single: false,
        key: 'tms-4',
        path: '/transport/billing',
        icon: 'logixon icon-finance',
        text: formatMsg(intl, 'billing'),
        sublinks: [{
          key: 'tms-4-0',
          path: '/transport/billing/fee',
          text: formatMsg(intl, 'billingExpense'),
        }, {
          key: 'tms-4-3',
          path: '/transport/billing/tariff',
          text: formatMsg(intl, 'billingTariff'),
        }],
      });
    }
    linkMenus.push({
      single: false,
      key: 'tms-5',
      icon: 'logixon icon-report',
      text: formatMsg(intl, 'analytics'),
      sublinks: [{
        key: 'tms-5-0',
        path: '/transport/analytics/kpi',
        text: formatMsg(intl, 'analyticsKPI'),
      }],
    });
    if (hasPermission(privileges, { module: 'transport', feature: 'resources' })) {
      linkMenus.push({
        single: false,
        key: 'tms-6',
        icon: 'logixon icon-setting-o',
        text: formatMsg(intl, 'settings'),
        sublinks: [{
          key: 'tms-6-0',
          path: '/transport/resources',
          text: formatMsg(intl, 'settingsResources'),
        }, {
          key: 'tms-6-1',
          path: '/transport/settings',
          text: formatMsg(intl, 'settingsApp'),
        }],
      });
    }
    this.setState({ linkMenus });
    if (this.props.children === null) {
      this.redirectInitialRoute(this.props.privileges);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.children === null && this.props.children !== nextProps.children) {
      this.redirectInitialRoute(nextProps.privileges);
    }
  }
  redirectInitialRoute(privileges) {
    // 首页跳转第一个有权限页面
    const route = findForemostRoute(privileges, 'transport', [{
      feat: 'dashboard',
      route: 'dashboard',
    }, {
      feat: 'shipment',
      route: 'shipment',
    }, {
      feat: 'dispatch',
      route: 'dispatch',
    }, {
      feat: 'tracking',
      route: 'tracking',
    }, {
      feat: 'resources',
      route: 'resources',
    }, {
      feat: 'tariff',
      route: 'tariff',
    }]);
    if (route) {
      this.context.router.replace(`/transport/${route}`);
    }
  }
  render() {
    return (
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
