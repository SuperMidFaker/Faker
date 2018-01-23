import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Layout, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { formatMsg } from './message.i18n';

const MenuItemGroup = Menu.ItemGroup;
const { Sider } = Layout;

@injectIntl
export default class HubSiderMenu extends React.Component {
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
          <MenuItemGroup key="integration" title={this.msg('integration')}>
            <Menu.Item key="apps">
              <NavLink to="/hub/integration/apps">
                <Icon type="shop" />{this.msg('appStore')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="installed">
              <NavLink to="/hub/integration/installed">
                <Icon type="api" />{this.msg('installedApps')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="dev">
              <NavLink to="/hub/dev">
                <Icon type="code-o" />{this.msg('devApps')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="adapter">
              <NavLink to="/hub/adapter">
                <Icon type="usb" />{this.msg('dataAdapters')}
              </NavLink>
            </Menu.Item>
          </MenuItemGroup>
          <MenuItemGroup key="collab" title={this.msg('collab')}>
            <Menu.Item key="invitation">
              <NavLink to="/hub/collab/invitation">
                <span><Icon type="team" /><span>{this.msg('invitations')}</span></span>
              </NavLink>
            </Menu.Item>
            <Menu.Item key="template">
              <NavLink to="/hub/collab/template">
                <span><Icon type="notification" /><span>{this.msg('templates')}</span></span>
              </NavLink>
            </Menu.Item>
          </MenuItemGroup>
        </Menu>
      </Sider>);
  }
}
