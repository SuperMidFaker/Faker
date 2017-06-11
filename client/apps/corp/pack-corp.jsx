import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Layout, Icon } from 'antd';
import { locationShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import MdIcon from 'client/components/MdIcon';
import CorpHeaderBar from 'client/components/corpHeaderBar';
import connectNav from 'client/common/decorators/connect-nav';
import NavLink from 'client/components/nav-link';
import { hasPermission } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const { Header, Sider } = Layout;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
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
    const corpMenu = [];
    const dataMenu = [];
    const { intl, privileges } = this.props;
    if (hasPermission(privileges, { module: 'corp', feature: 'info' })) {
      corpMenu.push(
        <MenuItem key="corpsetting-1">
          <NavLink to="/corp/info">
            <MdIcon mode="fontello" type="building" />{formatMsg(intl, 'corpInfo')}
          </NavLink>
        </MenuItem>
      );
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'personnel' })) {
      corpMenu.push(
        <MenuItem key="corpsetting-2">
          <NavLink to="/corp/members">
            <MdIcon mode="ikons" type="users" />{formatMsg(intl, 'personnelUser')}
          </NavLink>
        </MenuItem>
      );
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'role' })) {
      corpMenu.push(
        <MenuItem key="corpsetting-4">
          <NavLink to="/corp/role">
            <MdIcon type="shield-check" />{formatMsg(intl, 'roleTitle')}
          </NavLink>
        </MenuItem>
      );
    }
    dataMenu.push(
      <Menu.Item key="logs" disabled>
        <NavLink to="/corp/data/logs">
          <Icon type="exception" />操作日志
        </NavLink>
      </Menu.Item>
    );
    dataMenu.push(
      <Menu.Item key="export" disabled>
        <NavLink to="/corp/export">
          <Icon type="cloud-download-o" />导出申请
        </NavLink>
      </Menu.Item>);
    return (
      <Layout className="layout-wrapper">
        <Header>
          <CorpHeaderBar title="管理后台" />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <Menu defaultSelectedKeys={['corpsetting-0']} defaultOpenKeys={['corpMenu', 'dataMenu']} mode="inline">
              <MenuItem key="corpsetting-0">
                <NavLink to="/corp/overview">
                  <MdIcon mode="fontello" type="gauge" />{formatMsg(intl, 'corpOverview')}
                </NavLink>
              </MenuItem>
              <SubMenu key="corpMenu" title={<span><Icon type="setting" />企业设置</span>}>
                {corpMenu}
              </SubMenu>
              <SubMenu key="dataMenu" title={<span><Icon type="database" />数据监控</span>}>
                {dataMenu}
              </SubMenu>
            </Menu>
          </Sider>
          <Layout>
            {this.props.children}
          </Layout>
        </Layout>
      </Layout>);
  }
}
