import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover, Menu } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    avatar: state.account.profile.avatar
  })
)
export default class AmUserNav extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    avatar: PropTypes.string
  }
  render() {
    const MenuItem = Menu.Item;
    const { intl, avatar } = this.props;
    const defaultAvatar = `${__CDN__}/assets/img/avatar.jpg`;
    const userMenu = (
      <Menu>
        <MenuItem key="corps">
          <NavLink to="/account/profile">
            <i className="icon s7-user"></i>
            <span>{formatMsg(intl, 'userSetting')}</span>
          </NavLink>
        </MenuItem>
        <MenuItem>
          <NavLink to="/account/password">
            <i className="icon s7-lock"></i>
            <span>{formatMsg(intl, 'pwdSetting')}</span>
          </NavLink>
        </MenuItem>
        <Menu.Divider/>
        <MenuItem>
          <a href="/account/logout">
            <i className="icon s7-power"></i>
            <span>{formatMsg(intl, 'userLogout')}</span>
          </a>
        </MenuItem>
      </Menu>);
    return (
      <li className="dropdown">
        <Popover placement="bottomLeft" trigger="click" content={userMenu}>
          <a role="button" aria-expanded="false" className="dropdown-toggle">
            <img src={avatar || defaultAvatar } />
            <span className="angle-down s7-angle-down"></span>
          </a>
        </Popover>
      </li>);
  }
}
