import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
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
        icon: 'zmdi zmdi-arrow-split',
        text: '调度',
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'tracking' })) {
      linkMenus.push({
        single: true,
        key: 'tms-3',
        path: '/transport/tracking',
        icon: 'icon-fontello-truck',
        text: '追踪',
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'billing' })) {
      linkMenus.push({
        single: false,
        key: 'tms-4',
        path: '/transport/billing',
        icon: 'icon-fontello-credit-card-2',
        text: '账单',
        sublinks: [{
          key: 'tms-4-0',
          path: '/transport/billing/recievable',
          text: '应收账单',
        }, {
          key: 'tms-4-1',
          path: '/transport/billing/payable',
          text: '应付账单',
        }],
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'tariff' })) {
      linkMenus.push({
        single: true,
        key: 'tms-5',
        icon: 'icon-fontello-briefcase',
        path: '/transport/tariff',
        text: '报价',
      });
    }
    if (hasPermission(privileges, { module: 'transport', feature: 'resources' })) {
      linkMenus.push({
        single: false,
        key: 'tms-6',
        icon: 'zmdi zmdi-library',
        text: '资源',
        sublinks: [{
          key: 'tms-6-0',
          path: '/transport/resources/carrier',
          text: '承运商管理',
        }, {
          key: 'tms-6-1',
          path: '/transport/resources/vehicle',
          text: '车辆管理',
        }, {
          key: 'tms-6-2',
          path: '/transport/resources/driver',
          text: '司机管理',
        }, {
          key: 'tms-5-3',
          path: '/transport/resources/node',
          text: '地点管理',
        }],
      });
    }
    this.setState({ linkMenus });
    if (this.props.children === null) {
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
  }
  render() {
    return (
      <div className="am-content">
        <AmLeftSidebar links={this.state.linkMenus} location={this.props.location} />
        {this.props.children}
      </div>
    );
  }
}
