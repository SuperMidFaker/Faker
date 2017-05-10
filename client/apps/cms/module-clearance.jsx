import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
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
    children: PropTypes.node,
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
        disabled: true,
        path: '/clearance/dashboard',
        icon: 'icon-fontello-desktop',
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
          group: formatMsg(intl, 'import'),
          icon: 'anticon anticon-inbox',
          path: '/clearance/import/delegation',
          text: formatMsg(intl, 'importDelegation'),
        }, {
          key: 'cms-1-1',
          group: formatMsg(intl, 'import'),
          icon: 'anticon anticon-file-text',
          path: '/clearance/import/manifest',
          text: formatMsg(intl, 'importManifest'),
        }, {
          key: 'cms-1-2',
          group: formatMsg(intl, 'import'),
          icon: 'anticon anticon-file',
          path: '/clearance/import/customs',
          text: formatMsg(intl, 'importCustomsDecl'),
        }, {
          key: 'cms-1-3',
          disabled: true,
          group: formatMsg(intl, 'import'),
          path: '/clearance/import/ciq',
          text: formatMsg(intl, 'importCiqDecl'),
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
          group: formatMsg(intl, 'export'),
          icon: 'anticon anticon-inbox',
          path: '/clearance/export/delegation',
          text: formatMsg(intl, 'exportDelegation'),
        }, {
          key: 'cms-2-1',
          group: formatMsg(intl, 'export'),
          icon: 'anticon anticon-file-text',
          path: '/clearance/export/manifest',
          text: formatMsg(intl, 'exportManifest'),
        }, {
          key: 'cms-2-2',
          group: formatMsg(intl, 'export'),
          icon: 'anticon anticon-file',
          path: '/clearance/export/customs',
          text: formatMsg(intl, 'exportCustomsDecl'),
        }, {
          key: 'cms-2-3',
          disabled: true,
          group: formatMsg(intl, 'export'),
          path: '/clearance/export/ciq',
          text: formatMsg(intl, 'exportCiqDecl'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'import' })) {
      linkMenus.push({
        single: false,
        key: 'cms-4',
        icon: 'icon-fontello-database',
        text: formatMsg(intl, 'classification'),
        sublinks: [{
          key: 'cms-4-0',
          path: '/clearance/classification/tradeitem',
          text: formatMsg(intl, 'tradeItem'),
        }, {
          key: 'cms-4-1',
          path: '/clearance/classification/hscode',
          text: formatMsg(intl, 'hscode'),
        }, {
          key: 'cms-4-2',
          path: '/clearance/classification/special',
          text: formatMsg(intl, 'specialCategory'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'billing' })) {
      linkMenus.push({
        single: false,
        key: 'cms-3',
        path: '/clearance/billing',
        icon: 'icon-fontello-money-1',
        text: formatMsg(intl, 'billing'),
        sublinks: [{
          key: 'cms-3-0',
          group: formatMsg(intl, 'groupBilling'),
          path: '/clearance/billing/expense',
          text: formatMsg(intl, 'expense'),
        }, {
          key: 'cms-3-1',
          group: formatMsg(intl, 'groupInvoice'),
          path: '/clearance/billing/receivable',
          text: formatMsg(intl, 'billingReceivable'),
        }, {
          key: 'cms-3-2',
          group: formatMsg(intl, 'groupInvoice'),
          path: '/clearance/billing/payable',
          text: formatMsg(intl, 'billingPayable'),
        }, {
          key: 'cms-3-3',
          group: formatMsg(intl, 'groupQuote'),
          path: '/clearance/billing/quote',
          text: formatMsg(intl, 'quote'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'import' })) {
      linkMenus.push({
        single: false,
        key: 'cms-5',
        disabled: true,
        icon: 'icon-ikons-bar-chart-2',
        text: formatMsg(intl, 'analytics'),
        sublinks: [{
          key: 'cms-5-0',
          path: '/clearance/analytics/kpi',
          text: formatMsg(intl, 'analyticsKPI'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'settings' })) {
      linkMenus.push({
        single: false,
        key: 'cms-6',
        icon: 'zmdi zmdi-settings',
        text: formatMsg(intl, 'settings'),
        sublinks: [{
          key: 'cms-6-0',
          path: '/clearance/resources',
          text: formatMsg(intl, 'settingsResources'),
        }, {
          key: 'cms-6-1',
          path: '/clearance/settings',
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
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
