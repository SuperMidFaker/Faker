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
    children: PropTypes.object.isRequired,
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
                    <Icon type="shop" />系统整合
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="installed">
                  <NavLink to="/hub/integration/installed">
                    <Icon type="appstore-o" />整合管理
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="adapter">
                  <NavLink to="/hub/adapter">
                    <Icon type="usb" />数据适配
                  </NavLink>
                </Menu.Item>
              </MenuItemGroup>
              <MenuItemGroup key="api" title="接口">
                <Menu.Item key="auth">
                  <NavLink to="/hub/api/auth">
                    <Icon type="api" />API接口授权
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="webhook">
                  <NavLink to="/hub/api/webhook">
                    <Icon type="wifi" />提醒目标Webhook
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
              <Menu.Item key="docs" disabled>
                <span><Icon type="book" /><span>开发文档</span></span>
              </Menu.Item>
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
