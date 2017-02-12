import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Layout } from 'antd';
import NavLink from 'client/components/nav-link';
import SimpleHeaderBar from 'client/components/simpleHeaderBar';
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
          <SimpleHeaderBar title="消息中心" />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <Menu defaultSelectedKeys={['message']} mode="inline">
              <Menu.Item key="message">
                <NavLink to="/message/list">
                  <span><Icon type="message" /><span>消息通知</span></span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="setting" disabled>
                <NavLink to="/message/setting">
                  <span><Icon type="setting" /><span>通知设置</span></span>
                </NavLink>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Content className="main-content">
              {this.props.children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}
