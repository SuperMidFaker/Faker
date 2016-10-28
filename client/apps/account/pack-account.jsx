import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'antd';
import NavLink from 'client/components/nav-link';
import AmNavBar from 'client/components/am-navbar';
import { setNavTitle } from 'common/reducers/navbar';

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
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <aside className="side-bar no-left-menu no-top-bar">
            <h3>个人帐号</h3>
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
              <Menu.Item key="message">
                <NavLink to="/my/messages">
                  <span><Icon type="message" /><span>我的消息</span></span>
                </NavLink>
              </Menu.Item>
            </Menu>
          </aside>
          <div className="main-content no-top-bar with-side-bar">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
