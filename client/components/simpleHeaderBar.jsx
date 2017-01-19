import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Popover, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { loadTranslation, changeUserLocale } from '../../common/reducers/intl';
import { logout } from 'common/reducers/account';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './headerNavBar.less';

const formatMsg = format(messages);
const MenuItem = Menu.Item;
const MenuDivider = Menu.Divider;

@injectIntl
@connect(
  state => ({
    avatar: state.account.profile.avatar,
    loginId: state.account.loginId,
    locale: state.intl.locale,
  }),
  { logout, loadTranslation, changeUserLocale }
)
export default class SimpleHeaderBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    avatar: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    locale: PropTypes.oneOf(['en', 'zh']),
    changeUserLocale: PropTypes.func.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    title: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    visible: false,
  }
  handleLanguageSetting = () => {
    this.setState({ visible: true });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  handleLocaleChange = (ev) => {
    this.props.loadTranslation(ev.target.value);
    this.props.changeUserLocale(this.props.loginId, ev.target.value);
    this.setState({ visible: false });
  }
  handleLogout = () => {
    this.props.logout().then((result) => {
      if (!result.error) {
        window.location.href = '/login';
      }
    });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const { intl, avatar, title } = this.props;
    const defaultAvatar = `${__CDN__}/assets/img/avatar.jpg`;
    const userPopoverContent = (
      <div className="navbar-popover">
        <Menu>
          <MenuItem>
            <NavLink to="/my/profile">
              <Icon type="user" />
              <span>{formatMsg(intl, 'userAccount')}</span>
            </NavLink>
          </MenuItem>
          <MenuItem>
            <a role="button" onClick={this.handleLanguageSetting}>
              <i className="zmdi zmdi-globe zmdi-hc-fw" />
              <span>{formatMsg(intl, 'userLanguage')}</span>
            </a>
          </MenuItem>
          <MenuDivider />
          <MenuItem>
            <a role="button" onClick={this.handleLogout}>
              <Icon type="logout" />
              <span>{formatMsg(intl, 'userLogout')}</span>
            </a>
          </MenuItem>
        </Menu>
      </div>
    );
    const brandNav = (
      <NavLink to="/" className="navbar-toggle">
        <i className="zmdi zmdi-apps" />
      </NavLink>
      );
    return (
      <nav className="navbar navbar-default navbar-fixed-top layout-header">
        <div className="navbar-header">
          {brandNav}
        </div>
        <div className="navbar-title">
          {title}
        </div>
        <div className="nav navbar-right">
          <Menu mode="horizontal">
            <MenuItem>
              <Popover content={userPopoverContent} placement="bottomRight" trigger="click"
                onVisibleChange={this.handleVisibleChange}
              >
                <div>
                  <img className="navbar-avatar" src={avatar || defaultAvatar} alt="avatar" />
                  <i className="angle-down s7-angle-down" />
                </div>
              </Popover>
            </MenuItem>
          </Menu>
        </div>
      </nav>);
  }
}
