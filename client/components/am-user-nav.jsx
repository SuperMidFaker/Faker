import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover, Menu } from '../../reusable/ant-ui';
import NavLink from '../../reusable/components/nav-link';
import { ADMIN, ENTERPRISE, BRANCH } from '../../universal/constants';

@connect(
  state => ({
    username: state.account.username,
    usertype: state.account.type
  })
)
export default class AmUserNav extends React.Component {
  static propTypes = {
    username: PropTypes.string.isRequired,
    usertype: PropTypes.string.isRequired
  }
  render() {
    const MenuItem = Menu.Item;
    const settingMenus = [];
    if (this.props.usertype === ADMIN) {
      settingMenus.push(
        <MenuItem key="corps">
          <NavLink to="/account/corps">
            <span className="icon s7-config"></span>
            <span>主帐号管理</span>
          </NavLink>
        </MenuItem>);
    } else if (this.props.usertype === ENTERPRISE) {
      settingMenus.push(
        <MenuItem key="corp-info">
          <NavLink to="/account/corp/info">
            <span className="icon s7-config"></span>
            <span>帐号设置</span>
          </NavLink>
        </MenuItem>,
        <MenuItem key="corps">
          <NavLink to="/account/corps">
            <span className="icon s7-config"></span>
            <span>子帐号管理</span>
          </NavLink>
        </MenuItem>,
        <MenuItem key="personnels">
          <NavLink to="/account/personnels">
            <span className="icon s7-config"></span>
            <span>用户管理</span>
          </NavLink>
        </MenuItem>);
    } else if (this.props.usertype === BRANCH) {
      settingMenus.push(
        <MenuItem key="corp-info">
          <NavLink to="/account/corp/info">
            <span className="icon s7-config"></span>
            <span>帐号设置</span>
          </NavLink>
        </MenuItem>,
        <MenuItem key="personnels">
          <NavLink to="/account/personnels">
            <span className="icon s7-config"></span>
            <span>用户管理</span>
          </NavLink>
        </MenuItem>);
    }
    const userMenu = (
      <Menu>
        { settingMenus }
        <MenuItem>
          <NavLink to="/account/password">
            <span className="icon s7-user"></span>
            <span>修改密码</span>
          </NavLink>
        </MenuItem>
        <MenuItem>
          <a href="/account/logout">
            <span className="icon s7-power"></span>
            <span>退出登录</span>
          </a>
        </MenuItem>
      </Menu>);
    return (
      <li className="dropdown">
        <Popover placement="bottomLeft" trigger="click" overlay={userMenu}>
          <a role="button" aria-expanded="false" className="dropdown-toggle">
            <img src="/assets/img/avatar.jpg" />
            <span className="angle-down s7-angle-down"></span>
          </a>
        </Popover>
      </li>);
  }
}
