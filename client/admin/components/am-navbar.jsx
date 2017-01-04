import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import AmUserNav from './am-user-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    navTitle: state.navbar.navTitle,
  })
)
export default class HeaderNavBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navTitle: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  render() {
    const { intl, navTitle } = this.props;
    const moduleName = navTitle.moduleName;
    let amTitleNav = null;
    if (navTitle.depth === 2) {
      amTitleNav = (
        <span>
          {formatMsg(intl, navTitle.text)}
        </span>
      );
    } else if (navTitle.depth === 3) {
      amTitleNav = (
        <a role="button" onClick={navTitle.goBackFn}>
          <i className="zmdi zmdi-arrow-left" />
          {navTitle.text}
        </a>
      );
    }
    let brandNav = (<NavLink to="/" className={'navbar-brand'} />);
    if (navTitle.depth !== 1) {
      brandNav = (
        <Tooltip placement="right" title="主页">
          <span><NavLink to="/" className={`navbar-brand module-${moduleName}`} /></span>
        </Tooltip>
      );
    }
    return (
      <nav className={`navbar navbar-default navbar-fixed-top layout-header module-${moduleName}`}>
        <div className="navbar-header">
          <NavLink to="/" className="navbar-toggle">
            <i className="zmdi zmdi-apps" />
          </NavLink>
          {brandNav}
        </div>
        <div className="navbar-title">
          {amTitleNav}
        </div>
        <div className="nav navbar-right">
          <AmUserNav />
        </div>
      </nav>);
  }
}
