import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    privileges: state.account.privileges,
  })
)
export default class Clearance extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    privileges: PropTypes.object.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.object.isRequired,
  };
  static contextTypes = {
    router: routerShape.isRequired,
  }
  state = {
    linkMenus: [],
  }
  componentWillMount() {
    const { privileges, intl } = this.props;
    const linkMenus = [];
    if (hasPermission(privileges, { module: 'clearance', feature: 'import' })) {
      linkMenus.push({
        single: true,
        key: 'cms-1',
        path: '/clearance/import',
        icon: 'icon-ikons-login',
        text: formatMsg(intl, 'import'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'export' })) {
      linkMenus.push({
        single: true,
        key: 'cms-2',
        path: '/clearance/export',
        icon: 'icon-ikons-logout',
        text: formatMsg(intl, 'export'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'expense' })) {
      linkMenus.push({
        single: true,
        key: 'cms-3',
        path: '/clearance/expense',
        icon: 'zmdi zmdi-money-box',
        text: formatMsg(intl, 'expense'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'billing' })) {
      linkMenus.push({
        single: false,
        key: 'cms-4',
        path: '/clearance/billing',
        icon: 'icon-ikons-credit-card',
        text: formatMsg(intl, 'billing'),
        sublinks: [{
          key: 'tms-4-0',
          path: '/clearance/billing/receivable',
          text: '应收账单',
        }, {
          key: 'tms-4-1',
          path: '/clearance/billing/payable',
          text: '应付账单',
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'quote' })) {
      linkMenus.push({
        single: true,
        key: 'cms-5',
        path: '/clearance/quote',
        icon: 'zmdi zmdi-case',
        text: formatMsg(intl, 'quote'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'settings' })) {
      linkMenus.push({
        single: true,
        key: 'cms-6',
        path: '/clearance/settings',
        icon: 'zmdi zmdi-settings',
        text: formatMsg(intl, 'settings'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'resources' })) {
      linkMenus.push({
        single: false,
        key: 'cms-7',
        icon: 'zmdi zmdi-library',
        text: '资源',
        sublinks: [{
          key: 'tms-6-0',
          path: '/clearance/resources/broker',
          text: '供应商管理',
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
    const route = findForemostRoute(privileges, 'clearance', [{
      feat: 'import',
      route: 'import',
    }, {
      feat: 'export',
      route: 'export',
    }, {
      feat: 'quote',
      route: 'quote',
    }, {
      feat: 'expense',
      route: 'expense',
    }, {
      feat: 'billing',
      route: 'billing',
    }, {
      feat: 'settings',
      route: 'settings',
    }]);
    if (route) {
      this.context.router.replace(`/clearance/${route}`);
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
