import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Layout } from 'antd';
import NavLink from 'client/components/nav-link';
import HeaderNavBar from 'client/components/headerNavBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Sider, Header, Content } = Layout;

@connect()
export default class MessagePack extends React.Component {
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
          <HeaderNavBar />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <h2>消息中心</h2>
            <Menu defaultSelectedKeys={['message']} mode="inline">
              <Menu.Item key="message">
                <NavLink to="/message/list">
                  <span><Icon type="message" /><span>消息列表</span></span>
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
