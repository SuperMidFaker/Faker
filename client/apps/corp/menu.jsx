import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Layout, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { Logixon } from 'client/components/FontIcon';
import { formatMsg } from './message.i18n';

const MenuItemGroup = Menu.ItemGroup;
const { Sider } = Layout;

@injectIntl
export default class CorpSiderMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  render() {
    return (
      <Sider className="menu-sider">
        <Menu mode="inline" selectedKeys={[this.props.currentKey]}>
          <MenuItemGroup key="corpMenu" title={this.msg('corpSettings')}>
            <Menu.Item key="info">
              <NavLink to="/corp/info">
                <Logixon type="corp-o" />{this.msg('corpInfo')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="members">
              <NavLink to="/corp/members">
                <Logixon type="group" />{this.msg('corpMembers')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="role">
              <NavLink to="/corp/role">
                <Logixon type="security-o" />{this.msg('corpRole')}
              </NavLink>
            </Menu.Item>
          </MenuItemGroup>
          <MenuItemGroup key="collab" title={this.msg('corpCollab')}>
            <Menu.Item key="invitation">
              <NavLink to="/corp/collab/invitation">
                <span><Icon type="team" /><span>{this.msg('invitation')}</span></span>
              </NavLink>
            </Menu.Item>
          </MenuItemGroup>
          <MenuItemGroup key="dataMenu" title={this.msg('corpData')}>
            <Menu.Item key="logs">
              <NavLink to="/corp/logs">
                <Icon type="exception" />{this.msg('corpLogs')}
              </NavLink>
            </Menu.Item>
          </MenuItemGroup>
        </Menu>
      </Sider>);
  }
}
