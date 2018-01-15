import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Icon, Layout } from 'antd';
import NavLink from 'client/components/NavLink';
import CorpHeaderBar from 'client/components/corpHeaderBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Sider, Header, Content } = Layout;
const MenuItemGroup = Menu.ItemGroup;

@connect()
export default class DataHubPack extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  }
  componentWillMount() {
    this.props.dispatch(setNavTitle({
      depth: 1,
    }));
  }
  render() {
    return (
      <Layout className="welo-layout-wrapper">
        <Header>
          <CorpHeaderBar title="协作平台" />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <Menu
              defaultSelectedKeys={['installed']}
              defaultOpenKeys={['integration', 'api']}
              mode="inline"
            >
              <MenuItemGroup key="integration" title="整合">
                <Menu.Item key="apps">
                  <NavLink to="/hub/integration/apps">
                    <Icon type="shop" />应用市场
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="installed">
                  <NavLink to="/hub/integration/installed">
                    <Icon type="appstore-o" />整合应用
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
          </Sider>
          <Content>
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}
