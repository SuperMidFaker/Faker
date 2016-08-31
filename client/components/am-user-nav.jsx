import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Modal, Radio } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { loadTranslation, changeUserLocale } from '../../common/reducers/intl';
import { logout } from 'common/reducers/account';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const SubMenu = Menu.SubMenu;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    avatar: state.account.profile.avatar,
    loginId: state.account.loginId,
    locale: state.intl.locale,
  }),
  { logout, loadTranslation, changeUserLocale }
)
export default class AmUserNav extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    avatar: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    locale: PropTypes.oneOf(['en', 'zh']),
    changeUserLocale: PropTypes.func.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
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
    this.props.logout().then(result => {
      if (!result.error) {
        window.location.href = '/login';
      }
    });
  }
  render() {
    const MenuItem = Menu.Item;
    const { intl, avatar, locale } = this.props;
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
          <MenuItem key="profile">
            <NavLink to="/account/profile">
              <i className="zmdi zmdi-account-box zmdi-hc-fw" />
              <span>{formatMsg(intl, 'userSetting')}</span>
            </NavLink>
          </MenuItem>
          <MenuItem key="lang">
            <a role="button" onClick={this.handleLanguageSetting}>
              <i className="zmdi zmdi-globe zmdi-hc-fw" />
              <span>{formatMsg(intl, 'userLanguage')}</span>
            </a>
          </MenuItem>
          <MenuItem key="password">
            <NavLink to="/account/password">
              <i className="zmdi zmdi-lock zmdi-hc-fw" />
              <span>{formatMsg(intl, 'pwdSetting')}</span>
            </NavLink>
          </MenuItem>
          <Menu.Divider />
          <MenuItem key="logout">
            <a role="button" onClick={this.handleLogout}>
              <i className="zmdi zmdi-sign-in zmdi-hc-fw" />
              <span>{formatMsg(intl, 'userLogout')}</span>
            </a>
          </MenuItem>
        </SubMenu>
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
      </Menu>);
  }
}
