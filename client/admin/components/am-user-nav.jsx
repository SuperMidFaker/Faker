import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { logout } from 'common/reducers/account';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);
const SubMenu = Menu.SubMenu;

@injectIntl
@connect(
  state => ({
    avatar: state.account.profile.avatar,
  }),
  { logout }
)
export default class AmUserNav extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    avatar: PropTypes.string,
    logout: PropTypes.func.isRequired,
  }
  handleLogout = () => {
    this.props.logout().then((result) => {
      if (!result.error) {
        window.location.href = '/login';
      }
    });
  }
  render() {
    const MenuItem = Menu.Item;
    const { intl, avatar } = this.props;
    const defaultAvatar = `${__CDN__}/assets/img/avatar.jpg`;
    const subTitle = (
      <span>
        <img className="navbar-avatar" src={avatar || defaultAvatar} alt="avatar" />
        <i className="angle-down s7-angle-down" />
      </span>
    );
    return (
      <Menu mode="horizontal" className="navbar-user-menu">
        <SubMenu title={subTitle}>
          <MenuItem key="corps">
            <NavLink to="">
              <Icon type="solution" />
              <span>{formatMsg(intl, 'userSetting')}</span>
            </NavLink>
          </MenuItem>
          <MenuItem>
            <NavLink to="">
              <Icon type="lock" />
              <span>{formatMsg(intl, 'pwdSetting')}</span>
            </NavLink>
          </MenuItem>
          <Menu.Divider />
          <MenuItem>
            <a role="button" onClick={this.handleLogout}>
              <Icon type="logout" />
              <span>{formatMsg(intl, 'userLogout')}</span>
            </a>
          </MenuItem>
        </SubMenu>
      </Menu>);
  }
}
