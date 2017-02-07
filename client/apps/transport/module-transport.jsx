import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import { format } from 'client/common/i18n/helpers';
import messages from 'client/apps/message.i18n';

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
        icon: 'zmdi zmdi-tv-list',
        text: '工作台',
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'shipment' })) {
      linkMenus.push({
        single: true,
        key: 'tms-1',
        path: '/transport/shipment',
        icon: 'zmdi zmdi-inbox',
        text: formatMsg(intl, 'transportShipment'),
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'dispatch' })) {
      linkMenus.push({
        single: true,
        key: 'tms-2',
        path: '/transport/dispatch',
        icon: 'icon-fontello-fork',
        text: '调度',
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'tracking' })) {
      linkMenus.push({
        single: true,
        key: 'tms-3',
        path: '/transport/tracking',
        icon: 'icon-fontello-tasks',
        text: '追踪',
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'billing' })) {
      linkMenus.push({
        single: false,
        key: 'tms-4',
        path: '/transport/billing',
        icon: 'icon-fontello-money-1',
        text: '账务中心',
        sublinks: [{
          key: 'tms-4-0',
          path: '/transport/billing/fee',
          text: '费用管理',
        }, {
          key: 'tms-4-1',
          path: '/transport/billing/receivable',
          text: '应收账单',
        }, {
          key: 'tms-4-2',
          path: '/transport/billing/payable',
          text: '应付账单',
        }, {
          key: 'tms-4-3',
          path: '/transport/billing/tariff',
          text: '价格管理',
        }],
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'resources' })) {
      linkMenus.push({
        single: false,
        key: 'tms-5',
        icon: 'zmdi zmdi-settings',
        text: '设置',
        sublinks: [{
          key: 'tms-5-0',
          path: '/transport/resources',
          text: '资源设置',
        }, {
          key: 'tms-5-1',
          path: '/transport/settings',
          text: '应用设置',
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
