import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { switchNavOption } from 'common/reducers/cmsPreferences';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    privileges: state.account.privileges,
    cms: state.account.apps.cms,
  }),
  { switchNavOption }
)
export default class Clearance extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    privileges: PropTypes.shape({
      module_id: PropTypes.string,
      feature_id: PropTypes.string,
      action_id: PropTypes.string,
    }).isRequired,
    location: locationShape.isRequired,
    children: PropTypes.node,
  };
  static contextTypes = {
    router: routerShape.isRequired,
  }
  state = {
    linkMenus: [],
    appMenus: [],
  }
  componentWillMount() {
    const { privileges, intl, cms } = this.props;
    const linkMenus = [];
    const appMenus = [];
    if (hasPermission(privileges, { module: 'clearance', feature: 'dashboard' })) {
      linkMenus.push({
        single: true,
        key: 'cms-dashboard',
        path: '/clearance/dashboard',
        icon: 'logixon icon-dashboard',
        text: formatMsg(intl, 'dashboard'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'delegation' })) {
      linkMenus.push({
        single: true,
        key: 'cms-delegation',
        path: '/clearance/delegation',
        icon: 'logixon icon-delegation',
        text: formatMsg(intl, 'delegation'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'delegation' })) {
      linkMenus.push({
        single: true,
        key: 'cms-customs',
        path: '/clearance/cusdecl',
        icon: 'logixon icon-customs',
        text: formatMsg(intl, 'customsDecl'),
      });
      linkMenus.push({
        single: true,
        key: 'cms-ciq',
        path: '/clearance/ciqdecl',
        icon: 'logixon icon-ciq',
        text: formatMsg(intl, 'ciqDecl'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'compliance' })) {
      linkMenus.push({
        single: false,
        key: 'cms-compliance',
        icon: 'logixon icon-compliance',
        text: formatMsg(intl, 'compliance'),
        sublinks: [{
          key: 'cms-compliance-0',
          path: '/clearance/tradeitem',
          text: formatMsg(intl, 'tradeItem'),
        }, {
          key: 'cms-compliance-2',
          path: '/clearance/permit',
          text: formatMsg(intl, 'permit'),
        }, {
          key: 'cms-compliance-3',
          path: '/clearance/manual',
          text: formatMsg(intl, 'manual'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'billing' })) {
      linkMenus.push({
        single: false,
        key: 'cms-billing',
        icon: 'logixon icon-finance',
        text: formatMsg(intl, 'billing'),
        sublinks: [{
          key: 'cms-billing-0',
          path: '/clearance/billing/expense',
          text: formatMsg(intl, 'expense'),
        }, {
          key: 'cms-billing-3',
          path: '/clearance/billing/quote',
          text: formatMsg(intl, 'quote'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'analytics' })) {
      linkMenus.push({
        single: true,
        key: 'cms-analytics',
        icon: 'logixon icon-report',
        text: formatMsg(intl, 'analytics'),
        path: '/clearance/analytics',
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'settings' })) {
      const bottom = !cms.length > 0;
      linkMenus.push({
        single: true,
        bottom,
        key: 'cms-settings',
        path: '/clearance/settings',
        icon: 'logixon icon-setting-o',
        text: formatMsg(intl, 'settings'),
      });
      if (cms.length > 0) {
        if (cms.length === 1) {
          appMenus.push({
            single: true,
            bottom: true,
            key: cms[0].app_id,
            path: cms[0].url,
            icon: 'logixon icon-setting-o',
            text: formatMsg(intl, cms[0].app_name),
          });
        } else {
          appMenus.push({
            single: false,
            bottom: true,
            key: 'cms-app',
            icon: 'logixon icon-setting-o',
            text: formatMsg(intl, 'app'),
            sublinks: [],
          });
          cms.forEach((c, index) => {
            appMenus[0].sublinks.push({
              key: `cms-app-${index}`,
              path: c.url,
              text: formatMsg(intl, c.app_name),
            });
          });
        }
      }
    }
    this.setState({ linkMenus, appMenus });
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
      feat: 'dashboard',
      route: 'dashboard',
    }, {
      feat: 'delegation',
      route: 'delegation',
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
      <CollapsibleSiderLayout
        links={this.state.linkMenus}
        appMenus={this.state.appMenus}
        childContent={this.props.children}
        location={this.props.location}
      />
    );
  }
}
