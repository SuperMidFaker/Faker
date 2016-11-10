import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import CollapseSideLayout from 'client/components/collapseSideLayout';
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
    if (hasPermission(privileges, { module: 'clearance', feature: 'dashboard' })) {
      linkMenus.push({
        single: true,
        key: 'cms-0',
        path: '/clearance/dashboard',
        icon: 'zmdi zmdi-tv-list',
        text: formatMsg(intl, 'dashboard'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'import' })) {
      linkMenus.push({
        single: false,
        key: 'cms-1',
        path: '/clearance/import',
        icon: 'icon-ikons-login',
        text: formatMsg(intl, 'import'),
        sublinks: [{
          key: 'cms-1-0',
          path: '/clearance/import',
          text: formatMsg(intl, 'importDelegation'),
        }, {
          key: 'cms-1-1',
          path: '/clearance/import/declare/delg',
          text: '报关申报',
        }, {
          key: 'cms-1-2',
          path: '/clearance/import/ciq',
          text: '报检委托',
        }, {
          key: 'cms-1-3',
          path: '/clearance/import/declare/ciq',
          text: '报检申报',
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'export' })) {
      linkMenus.push({
        single: false,
        key: 'cms-2',
        path: '/clearance/export',
        icon: 'icon-ikons-logout',
        text: formatMsg(intl, 'export'),
        sublinks: [{
          key: 'cms-2-0',
          path: '/clearance/export',
          text: '报关委托',
        }, {
          key: 'cms-2-1',
          path: '/clearance/export/ciq',
          text: '报检',
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'billing' })) {
      linkMenus.push({
        single: false,
        key: 'cms-4',
        path: '/clearance/billing',
        icon: 'zmdi zmdi-money-box',
        text: formatMsg(intl, 'billing'),
        sublinks: [{
          key: 'tms-4-0',
          path: '/clearance/expense',
          text: formatMsg(intl, 'expense'),
        }, {
          key: 'tms-4-1',
          path: '/clearance/billing/receivable',
          text: formatMsg(intl, 'billingReceivable'),
        }, {
          key: 'tms-4-2',
          path: '/clearance/billing/payable',
          text: formatMsg(intl, 'billingPayable'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'resources' })) {
      linkMenus.push({
        single: false,
        key: 'cms-6',
        icon: 'zmdi zmdi-library',
        text: formatMsg(intl, 'resources'),
        sublinks: [{
          key: 'cms-6-0',
          path: '/clearance/resources/broker',
          text: formatMsg(intl, 'providers'),
        }, {
          key: 'cms-6-1',
          path: '/clearance/quote',
          text: formatMsg(intl, 'quote'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'settings' })) {
      linkMenus.push({
        single: true,
        key: 'cms-7',
        path: '/clearance/settings',
        icon: 'zmdi zmdi-settings',
        text: formatMsg(intl, 'settings'),
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
      <CollapseSideLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
