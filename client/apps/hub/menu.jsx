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
          <MenuItemGroup key="integration" title="整合">
            <Menu.Item key="apps">
              <NavLink to="/hub/integration/apps">
                <Icon type="shop" />应用市场
              </NavLink>
            </Menu.Item>
            <Menu.Item key="installed">
              <NavLink to="/hub/integration/installed">
                <Icon type="api" />整合应用
              </NavLink>
            </Menu.Item>
            <Menu.Item key="dev">
              <NavLink to="/hub/dev">
                <Icon type="code-o" />自建应用
              </NavLink>
            </Menu.Item>
            <Menu.Item key="adapter">
              <NavLink to="/hub/adapter">
                <Icon type="usb" />数据适配
              </NavLink>
            </Menu.Item>
          </MenuItemGroup>
          <MenuItemGroup key="collab" title="协作">
            <Menu.Item key="partners">
              <NavLink to="/hub/collab/partners">
                <span><Icon type="team" /><span>协作邀请</span></span>
              </NavLink>
            </Menu.Item>
          </MenuItemGroup>
        </Menu>
      </Sider>);
  }
}
