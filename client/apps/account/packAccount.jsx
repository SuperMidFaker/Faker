import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Icon, Layout, Row, Col } from 'antd';
import NavLink from 'client/components/NavLink';
import HeaderNavBar from 'client/components/HeaderNavBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Header, Content } = Layout;

@connect()
export default class AccountPack extends React.Component {
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
          <HeaderNavBar title="帐号设置" compact />
        </Header>
        <Content className="main-content main-content-no-page-header layout-fixed-width">
          <Row gutter={16}>
            <Col span={6}>
              <Menu defaultSelectedKeys={['profile']} mode="inline">
                <Menu.Item key="profile">
                  <NavLink to="/my/profile">
                    <span><Icon type="user" /><span>个人信息</span></span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="security">
                  <NavLink to="/my/password">
                    <span><Icon type="lock" /><span>修改密码</span></span>
                  </NavLink>
                </Menu.Item>
              </Menu>
            </Col>
            <Col span={18}>
              {this.props.children}
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }
}
