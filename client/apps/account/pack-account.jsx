import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Layout } from 'antd';
import NavLink from 'client/components/nav-link';
import SimpleHeaderBar from 'client/components/simpleHeaderBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Sider, Header, Content } = Layout;

@connect()
export default class AccountPack extends React.Component {
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
          <SimpleHeaderBar title="个人设置" />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <Menu defaultSelectedKeys={['profile']} mode="inline">
              <Menu.Item key="profile">
                <NavLink to="/my/profile">
                  <span><Icon type="user" /><span>个人资料</span></span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="security">
                <NavLink to="/my/password">
                  <span><Icon type="lock" /><span>安全设置</span></span>
                </NavLink>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Content className="main-content layout-fixed-width">
              {this.props.children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}
