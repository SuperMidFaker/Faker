import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import AmUserNav from './am-user-nav';
import ModuleLayout from './module-layout';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    navTitle: state.navbar.navTitle,
  }),
  { }
)
export default class AmNavBar extends React.Component {
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
      if (navTitle.withModuleLayout) {
        amTitleNav = (
          <Popover placement="bottomLeft" trigger="hover" content={<ModuleLayout />}>
            <a role="button" aria-expanded="false" className="dropdown-toggle">
              <i className={`hidden-xs zmdi zmdi-${moduleName}`}></i>
              {formatMsg(intl, navTitle.text)}
              <span className="angle-down s7-angle-down"></span>
            </a>
          </Popover>
          );
      } else {
        amTitleNav = (
          <a role="button" aria-expanded="false" className="dropdown-toggle">
            <i className={`hidden-xs zmdi zmdi-${moduleName}`} />
            {navTitle.text}
          </a>
        );
      }
    } else if (navTitle.depth === 3) {
      amTitleNav = (
        <a role="button" onClick={navTitle.goBackFn}>
          <i className="zmdi zmdi-arrow-left" />
          {navTitle.text}
        </a>
      );
    }
    return (
      <nav className={`navbar navbar-default navbar-fixed-top am-top-header module-${moduleName}`}>
        <div className="container-fluid">
          <div className="navbar-header">
            <div className="page-title">
              <span></span>
            </div>
            <NavLink to="/" className="am-toggle-left-sidebar navbar-toggle collapsed">
              <i className="zmdi zmdi-apps"></i>
            </NavLink>
            <NavLink to="/" className={`navbar-brand module-${moduleName}`} />
          </div>
          <div id="am-navbar-collapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav am-title-nav">
              <li className="dropdown">
              {amTitleNav}
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right am-user-nav">
              <AmUserNav />
            </ul>
          </div>
        </div>
      </nav>);
  }
}
