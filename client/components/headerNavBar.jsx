import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Radio, Modal, Popover, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { loadTranslation, changeUserLocale } from '../../common/reducers/intl';
import { logout } from 'common/reducers/account';
import NotificationPopover from './notification-popover';
import HelpcenterPopover from './helpcenter-popover';
import ModuleMenu from './module-menu';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './headerNavBar.less';

const formatMsg = format(messages);
const MenuItem = Menu.Item;
const MenuDivider = Menu.Divider;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    navTitle: state.navbar.navTitle,
    avatar: state.account.profile.avatar,
    loginId: state.account.loginId,
    locale: state.intl.locale,
  }),
  { logout, loadTranslation, changeUserLocale }
)
export default class HeaderNavBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navTitle: PropTypes.object.isRequired,
    avatar: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    locale: PropTypes.oneOf(['en', 'zh']),
    changeUserLocale: PropTypes.func.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
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
    const { navTitle } = this.props;
    const { intl, avatar, locale } = this.props;
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
    const helpcenterContent = (<HelpcenterPopover />);

    let moduleName = navTitle.moduleName;
    let amTitleNav = null;
    let brandNav = (<NavLink to="/" className={'navbar-brand'} />);
    if (navTitle.depth === 1) {
      moduleName = '';
    } else if (navTitle.depth === 2) {
      brandNav = (
        <NavLink to="/" className="navbar-toggle">
          <i className="zmdi zmdi-apps" />
        </NavLink>
      );
      amTitleNav = (
        <ModuleMenu />
      );
    } else if (navTitle.depth === 3) {
      brandNav = (
        <a role="button" className="navbar-toggle" onClick={navTitle.goBackFn}>
          <i className="zmdi zmdi-arrow-left" />
        </a>
      );
    }
    return (
      <nav className={`navbar navbar-default navbar-fixed-top layout-header module-${moduleName}`}>
        <div className="navbar-header">
          {brandNav}
        </div>
        <div className="navbar-title">
          {amTitleNav}
        </div>
        <div className="nav navbar-right">
          <Menu mode="horizontal">
            <MenuItem>
              <NotificationPopover />
            </MenuItem>
            <MenuItem>
              <Popover content={helpcenterContent} placement="bottomRight" trigger="click"
                onVisibleChange={this.handleVisibleChange}
              >
                <div><i className="icon s7-help1" /></div>
              </Popover>
            </MenuItem>
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
        <div className="navbar-search">
          <input type="search" placeholder={this.msg('search')} />
        </div>
        <Modal visible={this.state.visible} footer={[]}
          title={formatMsg(intl, 'userLanguage')} onCancel={this.handleCancel}
        >
          <div style={{ textAlign: 'center' }}>
            <RadioGroup size="large" onChange={this.handleLocaleChange} value={locale}>
              <RadioButton value="zh">简体中文</RadioButton>
              <RadioButton value="en">English</RadioButton>
            </RadioGroup>
          </div>
        </Modal>
      </nav>);
  }
}
