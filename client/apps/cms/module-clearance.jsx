import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import messages from './message.i18n.js';
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
    if (hasPermission(privileges, { module: 'clearance', feature: 'quote' })) {
      linkMenus.push({
        single: true,
        key: 'cms-5',
        path: '/clearance/quote',
        icon: 'zmdi zmdi-case',
        text: formatMsg(intl, 'quote'),
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
        single: true,
        key: 'cms-4',
        path: '/clearance/billing',
        icon: 'icon-ikons-credit-card',
        text: formatMsg(intl, 'billing'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'relation' })) {
      linkMenus.push({
        single: false,
        key: 'cms-6',
        icon: 'zmdi zmdi-settings',
        text: formatMsg(intl, 'settings'),
        sublinks: [{
          key: 'cms-3-1',
          path: '/clearance/relation',
          text: formatMsg(intl, 'relation'),
        }],
      });
    }
    this.setState({ linkMenus });
    if (this.props.children === null) {
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
        feat: 'relation',
        route: 'relation',
      }]);
      if (route) {
        this.context.router.replace(`/clearance/${route}`);
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
