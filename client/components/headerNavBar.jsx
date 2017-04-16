import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { Menu, Radio, Modal, Popover, Icon, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import MdIcon from './MdIcon';
import { loadTranslation, changeUserLocale } from '../../common/reducers/intl';
import { logout } from 'common/reducers/account';
import { goBackNav } from 'common/reducers/navbar';
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
  { logout, loadTranslation, changeUserLocale, goBackNav }
)
export default class HeaderNavBar extends React.Component {
  static defaultProps = {
    locale: 'zh',
  }
  static propTypes = {
    intl: intlShape.isRequired,
    navTitle: PropTypes.shape({
      depth: PropTypes.number.isRequired,
      stack: PropTypes.number.isRequired,
      moduleName: PropTypes.string,
    }).isRequired,
    avatar: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    locale: PropTypes.oneOf(['en', 'zh']),
    changeUserLocale: PropTypes.func.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: routerShape.isRequired,
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
  handleGoDepth2 = () => {
    this.context.router.go(-this.props.navTitle.stack);
  }
  handleGoBack = () => {
    this.context.router.goBack();
    this.props.goBackNav();
    // router.goBack on initial login next *TODO* history index
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
              <MdIcon type="globe" />
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
    let navMenu = null;
    let brandNav = (<NavLink to="/" className={'navbar-brand'} />);
    if (navTitle.depth === 1) {
      moduleName = '';
    } else if (navTitle.depth === 2) {
      brandNav = (
        <NavLink to="/" className="navbar-toggle">
          <MdIcon type="apps" />
        </NavLink>
      );
      navMenu = (
        <ModuleMenu />
      );
    } else if (navTitle.depth === 3) {
      brandNav = [(
        <Tooltip placement="bottomLeft" arrowPointAtCenter mouseEnterDelay={2} title="Go back to previous step" key="back" >
          <a role="button" className="navbar-anchor" key="back" onClick={this.handleGoBack}>
            <MdIcon type="arrow-left" />
          </a>
        </Tooltip>)];
      if (navTitle.jumpOut && this.props.navTitle.stack > 1) {
        brandNav.push(
          <Tooltip placement="bottomLeft" arrowPointAtCenter mouseEnterDelay={2} title="Close to up level" key="close" >
            <a role="button" className="navbar-anchor" key="close" onClick={this.handleGoDepth2}>
              <MdIcon type="close" />
            </a>
          </Tooltip>);
      }
    }
    return (
      <nav className={`navbar navbar-fixed-top layout-header module-${moduleName}`}>
        <div className="navbar-header">
          {brandNav}
        </div>
        <div className="navbar-menu">
          {navMenu}
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
