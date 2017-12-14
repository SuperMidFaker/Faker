import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './NavLink';
import { loadTranslation, changeUserLocale } from '../../common/reducers/preference';
import { logout } from 'common/reducers/account';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './HeaderNavBar/index.less';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    avatar: state.account.profile.avatar,
    loginId: state.account.loginId,
    locale: state.preference.locale,
    corpLogo: state.corpDomain.logo,
    corpName: state.corpDomain.name,
  }),
  { logout, loadTranslation, changeUserLocale }
)
export default class CorpHeaderBar extends React.Component {
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
    const { title, corpName, corpLogo } = this.props;
    const brandNav = (
      <NavLink to="/" className="navbar-toggle">
        <i className="zmdi zmdi-apps" />
      </NavLink>
    );
    return (
      <nav className="navbar navbar-fixed-top layout-header">
        <div className="navbar-header">
          {brandNav}
        </div>
        <div className="navbar-title">
          {title}
        </div>
        <div className="navbar-corp">
          <span className="logo" style={{ backgroundImage: `url("${corpLogo}")` }} />
          {corpName}
        </div>
      </nav>);
  }
}
