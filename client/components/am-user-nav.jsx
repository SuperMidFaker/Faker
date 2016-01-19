import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover, Menu } from '../../reusable/ant-ui';
import NavLink from '../../reusable/components/nav-link';
import { ENTERPRISE, BRANCH } from '../../universal/constants';

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
    if (this.props.usertype === ENTERPRISE || this.props.usertype === BRANCH) {
      settingMenus.push(
        <MenuItem key="corps">
          <NavLink to="/corp/info">
            <span className="icon s7-config"></span>
            <span>个人设置</span>
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
        <Menu.Divider/>
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
