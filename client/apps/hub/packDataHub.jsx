import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Icon, Layout } from 'antd';
import NavLink from 'client/components/nav-link';
import CorpHeaderBar from 'client/components/corpHeaderBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Sider, Header, Content } = Layout;
const SubMenu = Menu.SubMenu;

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
      <Layout className="layout-wrapper">
        <Header>
          <CorpHeaderBar title="开放平台" />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <Menu
              defaultSelectedKeys={['installed']}
              defaultOpenKeys={['integration', 'api']}
              mode="inline"
            >
              <SubMenu key="integration" title={<span><Icon type="appstore-o" /><span>应用整合</span></span>}>
                <Menu.Item key="installed">
                  <NavLink to="/hub/integration/installed">
                    已安装应用
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="apps">
                  <NavLink to="/hub/integration/apps">
                    应用中心
                  </NavLink>
                </Menu.Item>
              </SubMenu>
              <SubMenu key="api" title={<span><Icon type="api" /><span>开放API接口</span></span>}>
                <Menu.Item key="auth">
                  <NavLink to="/hub/api/auth">
                    API接口授权
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="webhook">
                  <NavLink to="/hub/api/webhook">
                    提醒目标Webhook
                  </NavLink>
                </Menu.Item>
              </SubMenu>
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