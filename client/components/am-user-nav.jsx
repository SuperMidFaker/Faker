import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);
const SubMenu = Menu.SubMenu;

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
    return (
      <Menu mode="horizontal">
        <SubMenu  title={<span><img className="avatar" src={avatar || defaultAvatar } /> <i className="angle-down s7-angle-down"/></span>}>
          <MenuItem key="corps">
            <NavLink to="/account/profile">
              <Icon type="solution" />
              <span>{formatMsg(intl, 'userSetting')}</span>
            </NavLink>
          </MenuItem>
          <MenuItem>
            <NavLink to="/account/password">
              <Icon type="lock" />
              <span>{formatMsg(intl, 'pwdSetting')}</span>
            </NavLink>
          </MenuItem>
          <Menu.Divider/>
          <MenuItem>
            <a href="/account/logout">
              <Icon type="logout" />
              <span>{formatMsg(intl, 'userLogout')}</span>
            </a>
          </MenuItem>
        </SubMenu>
      </Menu>);
  }
}
