import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Badge, Radio, Modal, Popover } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { loadTranslation, changeUserLocale } from '../../common/reducers/intl';
import { logout } from 'common/reducers/account';
import MessagePrompt from './messagePrompt';
import ModuleMenu from './module-menu';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuDivider = Menu.Divider;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    navTitle: state.navbar.navTitle,
    notReadMessagesNum: state.corps.notReadMessagesNum,
    avatar: state.account.profile.avatar,
    loginId: state.account.loginId,
    locale: state.intl.locale,
  }),
  { logout, loadTranslation, changeUserLocale }
)
export default class AmNavBar extends React.Component {
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
  render() {
    const { navTitle, notReadMessagesNum } = this.props;
    const { intl, avatar, locale } = this.props;
    const defaultAvatar = `${__CDN__}/assets/img/avatar.jpg`;
    const subTitle = (
      <span>
        <img className="navbar-avatar" src={avatar || defaultAvatar} alt="avatar" />
        <i className="angle-down s7-angle-down" />
      </span>
    );

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
      <nav className={`navbar navbar-default navbar-fixed-top am-top-header module-${moduleName}`}>
        <div className="navbar-header">
          {brandNav}
        </div>
        <div className="navbar-title">
          {amTitleNav}
        </div>
        <div className="nav navbar-right">
          <Menu mode="horizontal">
            <MenuItem>
              <Popover content="{content}" title="Title" placement="bottom" trigger="hover"
                onVisibleChange={this.handleVisibleChange}
              >
                <div><Badge count={notReadMessagesNum} overflowCount={99}><i className="icon s7-bell" /></Badge></div>
              </Popover>
            </MenuItem>
            <MenuItem>
              <Popover content="{content}" title="Title" placement="bottom" trigger="hover"
                onVisibleChange={this.handleVisibleChange}
              >
                <div><i className="icon s7-help1" /></div>
              </Popover>
            </MenuItem>
            <SubMenu title={subTitle}>
              <MenuItem>
                <NavLink to="/my/profile">
                  <i className="zmdi zmdi-account-box zmdi-hc-fw" />
                  <span>{formatMsg(intl, 'userSetting')}</span>
                </NavLink>
              </MenuItem>
              <MenuItem>
                <a role="button" onClick={this.handleLanguageSetting}>
                  <i className="zmdi zmdi-globe zmdi-hc-fw" />
                  <span>{formatMsg(intl, 'userLanguage')}</span>
                </a>
              </MenuItem>
              <MenuItem>
                <NavLink to="/my/password">
                  <i className="zmdi zmdi-lock zmdi-hc-fw" />
                  <span>{formatMsg(intl, 'pwdSetting')}</span>
                </NavLink>
              </MenuItem>
              <MenuDivider />
              <MenuItem>
                <a role="button" onClick={this.handleLogout}>
                  <i className="zmdi zmdi-sign-in zmdi-hc-fw" />
                  <span>{formatMsg(intl, 'userLogout')}</span>
                </a>
              </MenuItem>
            </SubMenu>
          </Menu>
        </div>
        <MessagePrompt />
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
