import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'antd';
import NavLink from 'client/components/nav-link';
import HeaderNavBar from 'client/components/headerNavBar';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';

@connect()
@connectNav({
  depth: 3,
})
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
      <div className="layout-wrapper layout-nosider-left">
        <HeaderNavBar />
        <div className="layout-content">
          <aside className="side-bar no-left-menu no-top-bar">
            <h2>个人帐号</h2>
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
          </aside>
          <div className="main-content no-top-bar with-side-bar">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
