import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover, Menu } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from '../../reusable/components/nav-link';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    username: state.account.username,
    usertype: state.account.type
  })
)
export default class AmUserNav extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    username: PropTypes.string.isRequired,
    usertype: PropTypes.string.isRequired
  }
  render() {
    const MenuItem = Menu.Item;
    const { intl } = this.props;
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
        <Popover placement="bottomLeft" trigger="click" overlay={userMenu}>
          <a role="button" aria-expanded="false" className="dropdown-toggle">
            <img src="/assets/img/avatar.jpg" />
            <span className="angle-down s7-angle-down"></span>
          </a>
        </Popover>
      </li>);
  }
}
