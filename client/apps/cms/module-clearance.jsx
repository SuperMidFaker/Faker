import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { findForemostRoute, hasPermission } from 'client/common/decorators/withPrivilege';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import { switchNavOption } from 'common/reducers/cmsPreferences';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    privileges: state.account.privileges,
    navOption: state.cmsPreferences.navOption,
  }),
  { switchNavOption }
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
    let navOption = 'CC';
    if (typeof window !== 'undefined' && window.localStorage) {
      navOption = this.props.navOption;
      const navtopt = window.localStorage.getItem('cms-nav-option');
      if (navtopt === null) {
        window.localStorage.setItem('cms-nav-option', navOption);
      } else {
        navOption = navtopt;
        this.props.switchNavOption(navOption);
      }
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'dashboard' })) {
      linkMenus.push({
        single: true,
        key: 'cms-dashboard',
        path: '/clearance/dashboard',
        icon: 'logixon icon-apps',
        text: formatMsg(intl, 'dashboard'),
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'delegation' })) {
      linkMenus.push(
        {
          single: true,
          key: 'cms-delegation',
          path: '/clearance/delegation',
          icon: 'logixon icon-delegation',
          text: formatMsg(intl, 'delegation'),
        }
      );
    }
    if (navOption === 'CC' || navOption === 'ALL') {
      linkMenus.push(
        {
          single: true,
          key: 'cms-customs',
          path: '/clearance/customs',
          icon: 'logixon icon-customs',
          text: formatMsg(intl, 'customsDecl'),
        }
      );
      linkMenus.push(
        {
          single: true,
          disabled: true,
          key: 'cms-ciq',
          path: '/clearance/ciq',
          icon: 'logixon icon-ciq',
          text: formatMsg(intl, 'ciqDecl'),
        }
      );
    }
    if (navOption === 'IE' || navOption === 'ALL') {
      linkMenus.push({
        single: false,
        key: 'cms-import',
        path: '/clearance/import',
        icon: 'icon-ikons-login',
        text: formatMsg(intl, 'import'),
        sublinks: [{
          key: 'cms-import-2',
          path: '/clearance/import/customs',
          text: formatMsg(intl, 'importCustomsDecl'),
        }, {
          key: 'cms-import-3',
          disabled: true,
          path: '/clearance/import/ciq',
          text: formatMsg(intl, 'importCiqDecl'),
        }],
      });
      linkMenus.push({
        single: false,
        key: 'cms-export',
        path: '/clearance/export',
        icon: 'icon-ikons-logout',
        text: formatMsg(intl, 'export'),
        sublinks: [{
          key: 'cms-export-2',
          path: '/clearance/export/customs',
          text: formatMsg(intl, 'exportCustomsDecl'),
        }, {
          key: 'cms-export-3',
          disabled: true,
          path: '/clearance/export/ciq',
          text: formatMsg(intl, 'exportCiqDecl'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'import' })) {
      linkMenus.push({
        single: false,
        key: 'cms-classification',
        icon: 'logixon icon-resource',
        text: formatMsg(intl, 'classification'),
        sublinks: [{
          key: 'cms-classification-0',
          path: '/clearance/classification/tradeitem',
          text: formatMsg(intl, 'tradeItem'),
        }, {
          key: 'cms-classification-1',
          path: '/clearance/classification/hscode',
          text: formatMsg(intl, 'hscode'),
        }, {
          key: 'cms-classification-2',
          path: '/clearance/classification/special',
          text: formatMsg(intl, 'specialCategory'),
        }],
      });
    }
    if (hasPermission(privileges, { module: 'clearance', feature: 'delegation' })) {
      linkMenus.push({
        single: true,
        key: 'cms-certification',
        disabled: true,
        icon: 'logixon icon-certs-mng',
        path: '/clearance/certification',
        text: formatMsg(intl, 'certification'),
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
    if (hasPermission(privileges, { module: 'clearance', feature: 'settings' })) {
      linkMenus.push({
        single: false,
        key: 'cms-settings',
        icon: 'logixon icon-setting-o',
        text: formatMsg(intl, 'settings'),
        sublinks: [{
          key: 'cms-settings-0',
          path: '/clearance/settings/resources',
          text: formatMsg(intl, 'resources'),
        }, {
          key: 'cms-settings-1',
          path: '/clearance/settings/brokers',
          text: formatMsg(intl, 'brokers'),
        }, {
          key: 'cms-settings-4',
          path: '/clearance/settings/preferences',
          text: formatMsg(intl, 'preferences'),
        }],
      });
    }
    this.setState({ linkMenus });
    if (this.props.children === null) {
      this.redirectInitialRoute(this.props.privileges);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { intl } = this.props;
    if (nextProps.navOption !== this.props.navOption) {
      const linkMenus = this.state.linkMenus.filter(lm => lm.key !== 'cms-import' && lm.key !== 'cms-export' && lm.key !== 'cms-customs' && lm.key !== 'cms-ciq');
      if (nextProps.navOption === 'CC') {
        linkMenus.splice(2, 0,
          {
            single: true,
            key: 'cms-customs',
            path: '/clearance/customs',
            icon: 'logixon icon-customs',
            text: formatMsg(intl, 'customsDecl'),
          },
          {
            single: true,
            disabled: true,
            key: 'cms-ciq',
            path: '/clearance/ciq',
            icon: 'logixon icon-ciq',
            text: formatMsg(intl, 'ciqDecl'),
          }
        );
      } else if (nextProps.navOption === 'IE') {
        linkMenus.splice(2, 0,
          {
            single: false,
            key: 'cms-import',
            path: '/clearance/import',
            icon: 'icon-ikons-login',
            text: formatMsg(intl, 'import'),
            sublinks: [{
              key: 'cms-import-2',
              path: '/clearance/import/customs',
              text: formatMsg(intl, 'importCustomsDecl'),
            }, {
              key: 'cms-import-3',
              disabled: true,
              group: formatMsg(intl, 'import'),
              path: '/clearance/import/ciq',
              text: formatMsg(intl, 'importCiqDecl'),
            }],
          },
          {
            single: false,
            key: 'cms-export',
            path: '/clearance/export',
            icon: 'icon-ikons-logout',
            text: formatMsg(intl, 'export'),
            sublinks: [{
              key: 'cms-export-2',
              path: '/clearance/export/customs',
              text: formatMsg(intl, 'exportCustomsDecl'),
            }, {
              key: 'cms-export-3',
              disabled: true,
              group: formatMsg(intl, 'export'),
              path: '/clearance/export/ciq',
              text: formatMsg(intl, 'exportCiqDecl'),
            }],
          }
        );
      } else if (nextProps.navOption === 'ALL') {
        linkMenus.splice(2, 0,
          {
            single: true,
            key: 'cms-customs',
            path: '/clearance/customs',
            icon: 'logixon icon-customs',
            text: formatMsg(intl, 'customsDecl'),
          },
          {
            single: true,
            disabled: true,
            key: 'cms-ciq',
            path: '/clearance/ciq',
            icon: 'logixon icon-ciq',
            text: formatMsg(intl, 'ciqDecl'),
          },
          {
            single: false,
            key: 'cms-import',
            path: '/clearance/import',
            icon: 'icon-ikons-login',
            text: formatMsg(intl, 'import'),
            sublinks: [{
              key: 'cms-import-2',
              path: '/clearance/import/customs',
              text: formatMsg(intl, 'importCustomsDecl'),
            }, {
              key: 'cms-import-3',
              disabled: true,
              group: formatMsg(intl, 'import'),
              path: '/clearance/import/ciq',
              text: formatMsg(intl, 'importCiqDecl'),
            }],
          },
          {
            single: false,
            key: 'cms-export',
            path: '/clearance/export',
            icon: 'icon-ikons-logout',
            text: formatMsg(intl, 'export'),
            sublinks: [{
              key: 'cms-export-2',
              path: '/clearance/export/customs',
              text: formatMsg(intl, 'exportCustomsDecl'),
            }, {
              key: 'cms-export-3',
              disabled: true,
              group: formatMsg(intl, 'export'),
              path: '/clearance/export/ciq',
              text: formatMsg(intl, 'exportCiqDecl'),
            }],
          }
        );
      }
      this.setState({ linkMenus });
    }
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
      <CollapsibleSiderLayout links={this.state.linkMenus} childContent={this.props.children} location={this.props.location} />
    );
  }
}
