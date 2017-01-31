import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Layout } from 'antd';
import NavLink from 'client/components/nav-link';
import CorpHeaderBar from 'client/components/corpHeaderBar';
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
          <CorpHeaderBar title="开放平台" />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <Menu defaultSelectedKeys={['apps']} mode="inline">
              <Menu.Item key="apps">
                <NavLink to="/open/apps">
                  <span><Icon type="user" /><span>应用管理</span></span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="security">
                <NavLink to="/my/password">
                  <span><Icon type="lock" /><span>安全设置</span></span>
                </NavLink>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content className="main-content">
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}
