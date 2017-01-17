import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Layout } from 'antd';
import { locationShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import SimpleHeaderBar from 'client/components/simpleHeaderBar';
import connectNav from 'client/common/decorators/connect-nav';
import NavLink from 'client/components/nav-link';
import { hasPermission } from 'client/common/decorators/withPrivilege';
import { TENANT_LEVEL } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const { Header, Content } = Layout;
const MenuItem = Menu.Item;
@injectIntl
@connect(
  state => ({
    level: state.account.tenantLevel,
    privileges: state.account.privileges,
  })
)
@connectNav({
  text: '管理面板',
  moduleName: 'corp',
})
export default class CorpPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    level: PropTypes.number.isRequired,
    privileges: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }
  static childContextTypes = {
    location: locationShape.isRequired,
  }

  getChildContext() {
    return { location: this.props.location };
  }

  render() {
    const linkMenus = [];
    const { intl, privileges, level } = this.props;
    if (hasPermission(privileges, { module: 'corp', feature: 'overview' })) {
      linkMenus.push(
        <MenuItem key="corpsetting-0">
          <NavLink to="/corp/overview">
            <i className="icon-fontello-gauge" /> {formatMsg(intl, 'corpOverview')}
          </NavLink>
        </MenuItem>
      );
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'info' })) {
      linkMenus.push(
        <MenuItem key="corpsetting-1">
          <NavLink to="/corp/info">
            <i className="icon-fontello-building" /> {formatMsg(intl, 'corpInfo')}
          </NavLink>
        </MenuItem>
      );
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'personnel' })) {
      linkMenus.push(
        <MenuItem key="corpsetting-2">
          <NavLink to="/corp/personnel">
            <i className="icon-ikons-users" /> {formatMsg(intl, 'personnelUser')}
          </NavLink>
        </MenuItem>
      );
    }
    if (
      level === TENANT_LEVEL.ENTERPRISE &&
      hasPermission(privileges, { module: 'corp', feature: 'organization' })
    ) {
      linkMenus.push(
        <MenuItem key="corpsetting-3">
          <NavLink to="/corp/organization">
            <i className="icon-fontello-sitemap" /> {formatMsg(intl, 'organTitle')}
          </NavLink>
        </MenuItem>
      );
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'role' })) {
      linkMenus.push(
        <MenuItem key="corpsetting-4">
          <NavLink to="/corp/role">
            <i className="zmdi zmdi-shield-check" /> {formatMsg(intl, 'roleTitle')}
          </NavLink>
        </MenuItem>
      );
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'partners' })) {
      linkMenus.push(
        <MenuItem key="corpsetting-5">
          <NavLink to="/corp/partners">
            <i className="icon-fontello-network" /> {formatMsg(intl, 'partnership')}
          </NavLink>
        </MenuItem>
      );
    }
    return (
      <Layout className="layout-wrapper">
        <Header>
          <SimpleHeaderBar title="管理后台" />
        </Header>
        <Content>
          <Header className="top-bar">
            <Menu defaultSelectedKeys={['corpsetting-0']} mode="horizontal">
              {linkMenus}
            </Menu>
          </Header>
          {this.props.children}
        </Content>
      </Layout>);
  }
}
