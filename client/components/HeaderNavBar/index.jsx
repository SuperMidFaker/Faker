import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { Avatar, Menu, Popover, Icon, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadTranslation, changeUserLocale, showPreferenceDock } from 'common/reducers/preference';
import { showActivitiesDock } from 'common/reducers/activities';
import { logout } from 'common/reducers/account';
import { goBackNav } from 'common/reducers/navbar';
import ModuleMenu from 'client/components/ModuleMenu';
import { format } from 'client/common/i18n/helpers';
import NotifyPopover from './notifyPopover';
import NavLink from '../NavLink';
import { Logixon } from '../FontIcon';
import messages from '../message.i18n';
import './style.less';

const formatMsg = format(messages);
const MenuItem = Menu.Item;
const MenuDivider = Menu.Divider;


@injectIntl
@connect(
  state => ({
    navTitle: state.navbar.navTitle,
    avatar: state.account.profile.avatar,
    name: state.account.profile.name,
    loginId: state.account.loginId,
    locale: state.preference.locale,
  }),
  {
    logout, loadTranslation, changeUserLocale, goBackNav, showPreferenceDock, showActivitiesDock,
  }
)
export default class HeaderNavBar extends React.Component {
  static propTypes = {
    compact: PropTypes.bool,
    intl: intlShape.isRequired,
    navTitle: PropTypes.shape({
      depth: PropTypes.number.isRequired,
      stack: PropTypes.number.isRequired,
      moduleName: PropTypes.string,
    }).isRequired,
    avatar: PropTypes.string,
    name: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    changeUserLocale: PropTypes.func.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  static defaultProps = {
    compact: false,
  }
  state = {
    userPopoverVisible: false,
  }
  handleLocaleChange = (ev) => {
    this.props.loadTranslation(ev.target.value);
    this.props.changeUserLocale(this.props.loginId, ev.target.value);
  }
  handleShowPreference = () => {
    this.setState({ userPopoverVisible: false });
    this.props.showPreferenceDock();
  }
  handleShowActivities = () => {
    this.setState({ userPopoverVisible: false });
    this.props.showActivitiesDock();
  }
  handleVisibleChange = (userPopoverVisible) => {
    this.setState({ userPopoverVisible });
  }
  handleLogout = () => {
    this.props.logout().then((result) => {
      if (!result.error) {
        window.location.href = '/login';
      }
    });
  }
  handleGoAccount = () => {
    window.open('/my/profile');
  }
  handleGoDepth2 = () => {
    this.context.router.go(-this.props.navTitle.stack);
  }
  handleGoBack = () => {
    this.context.router.goBack();
    this.props.goBackNav();
    // router.goBack on initial login next *TODO* history index
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values);
  render() {
    const {
      intl, avatar, name, compact, navTitle,
    } = this.props;
    const helpPopoverContent = (
      <Menu>
        <MenuItem>
          <a role="presentation" onClick={this.handleOnlineService}>
            <Icon type="customerservice" />
            <span>{this.msg('online')}</span>
          </a>
        </MenuItem>
        <MenuItem>
          <a role="presentation" onClick={this.handleGuide}>
            <Icon type="bulb" />
            <span>{this.msg('guide')}</span>
          </a>
        </MenuItem>
      </Menu>
    );
    const userPopoverContent = (
      <Menu>
        {!compact &&
        <MenuItem>
          <a role="presentation" onClick={this.handleGoAccount}>
            <Icon type="user" />
            <span>{formatMsg(intl, 'userAccount')}</span>
          </a>
          </MenuItem>}
        {!compact &&
        <MenuItem>
          <a role="presentation" onClick={this.handleShowPreference}>
            <Icon type="tool" />
            <span>{formatMsg(intl, 'userPreference')}</span>
          </a>
          </MenuItem>}
        {!compact &&
        <MenuDivider />}
        {!compact &&
        <MenuItem>
          <a role="presentation" onClick={this.handleShowActivities}>
            <Icon type="solution" />
            <span>{formatMsg(intl, 'userActivities')}</span>
          </a>
          </MenuItem>}
        {!compact &&
        <MenuDivider />}
        <MenuItem>
          <a role="presentation" onClick={this.handleLogout}>
            <Icon type="poweroff" />
            <span>{formatMsg(intl, 'userLogout')}</span>
          </a>
        </MenuItem>
      </Menu>
    );
    let { moduleName } = navTitle;
    let navMenu = null;
    let brandNav = (<NavLink to="/" className="navbar-brand" />);
    if (navTitle.depth === 1) {
      moduleName = '';
    } else if (navTitle.depth === 2) {
      brandNav = (
        <NavLink to="/" className="navbar-toggle">
          <Logixon type="grid" />
        </NavLink>
      );
      navMenu = (
        <ModuleMenu />
      );
    } else if (navTitle.depth === 3) {
      brandNav = [(
        <Tooltip placement="bottomLeft" arrowPointAtCenter mouseEnterDelay={2} title={this.msg('back')} key="back" >
          <a role="presentation" className="navbar-anchor" key="back" onClick={this.handleGoBack}>
            <Icon type="arrow-left" />
          </a>
        </Tooltip>)];
      if (navTitle.jumpOut && this.props.navTitle.stack > 1) {
        brandNav.push(<Tooltip placement="bottomLeft" arrowPointAtCenter mouseEnterDelay={2} title={this.msg('close')} key="close" >
          <a role="presentation" className="navbar-anchor" key="close" onClick={this.handleGoDepth2}>
            <Icon type="close" />
          </a>
        </Tooltip>);
      }
    }
    return (
      <nav className={`navbar layout-header module-${moduleName}`}>
        <div className="navbar-header">
          {brandNav}
        </div>
        <div className="navbar-menu">
          {navMenu}
        </div>
        <div className="nav navbar-right">
          <Menu mode="horizontal">
            {!compact &&
            <MenuItem>
              <NotifyPopover />
            </MenuItem>}
            {!compact &&
            <MenuItem>
              <Popover
                content={helpPopoverContent}
                placement="bottomRight"
                trigger="click"
                overlayClassName="navbar-popover"
              >
                <div><Icon type="question-circle-o" /></div>
              </Popover>
            </MenuItem>}
            <MenuItem>
              <Popover
                content={userPopoverContent}
                placement="bottomRight"
                trigger="click"
                visible={this.state.userPopoverVisible}
                onVisibleChange={this.handleVisibleChange}
                overlayClassName="navbar-popover"
              >
                <div>
                  {avatar ? <Avatar src={avatar} /> : <Avatar >{name}</Avatar>}
                </div>
              </Popover>
            </MenuItem>
          </Menu>
        </div>
        <div className="navbar-search">
          <input type="search" placeholder={this.msg('search')} />
        </div>
      </nav>);
  }
}
