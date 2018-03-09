import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { loadTranslation, changeUserLocale } from 'common/reducers/preference';
import { logout } from 'common/reducers/account';
import { format } from 'client/common/i18n/helpers';
import NavLink from './NavLink';
import messages from './message.i18n';
import './HeaderNavBar/style.less';

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
export default class TransparentHeaderBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    title: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const { title, corpName, corpLogo } = this.props;
    const brandNav = (
      <NavLink to="/" className="navbar-brand" />
    );
    return (
      <nav className="navbar navbar-transparent navbar-fixed-top layout-header">
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
