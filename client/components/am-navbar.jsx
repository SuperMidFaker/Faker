import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover, Tooltip } from '../../reusable/ant-ui';
import NavLink from '../../reusable/components/nav-link';
import AmUserNav from './am-user-nav';
import ModuleLayout from './module-layout';

@connect(
  state => ({
    navTitle: state.navbar.navTitle
  })
)
export default class AmNavBar extends React.Component {
  static propTypes = {
    navTitle: PropTypes.object.isRequired
  }
  render() {
    const { navTitle } = this.props;
    const moduleName = navTitle.moduleName;
    let amTitleNav = null;
    if (navTitle.depth === 2) {
      if (navTitle.withModuleLayout) {
        amTitleNav = (
          <Popover placement="bottomLeft" trigger="click" overlay={<ModuleLayout />}>
            <a role="button" aria-expanded="false" className="dropdown-toggle">
              <i className={`zmdi zmdi-${moduleName}`}></i>
              {navTitle.text}
              <span className="angle-down s7-angle-down"></span>
            </a>
          </Popover>);
      } else {
        amTitleNav = (
          <a role="button" aria-expanded="false" className="dropdown-toggle">
            <i className={`zmdi zmdi-${moduleName}`}></i>
            {navTitle.text}
          </a>);
      }
    } else if (navTitle.depth === 3) {
      amTitleNav = (
        <a role="button" onClick={navTitle.goBackFn}>
          <i className={`zmdi zmdi-arrow-left`}></i>
          {navTitle.text}
        </a>);
    }
    return (
      <nav className={`navbar navbar-default navbar-fixed-top am-top-header module-${moduleName}`}>
        <div className="container-fluid">
          <div className="navbar-header">
            <div className="page-title">
              <span>微骆</span>
            </div>
            <NavLink to="/" className="am-toggle-left-sidebar navbar-toggle collapsed">
              <i className="zmdi zmdi-apps"></i>
            </NavLink>
            <Tooltip placement="right" title="返回首页">
              <NavLink to="/" className={`navbar-brand module-${moduleName}`} />
            </Tooltip>
          </div>
          <div id="am-navbar-collapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav am-title-nav">
              <li className="dropdown">
              { amTitleNav }
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right am-user-nav">
              <AmUserNav />
            </ul>
            <ul className="nav navbar-nav navbar-right am-icons-nav">
              <li className="dropdown hidden-xs">
                <a className="dropdown-toggle" aria-expanded="false" role="button">
                  <span className="icon s7-comment"></span>
                </a>
              </li>
              <li className="dropdown hidden-xs">
                <a className="dropdown-toggle" role="button" aria-expanded="false">
                  <span className="icon s7-bell"></span>
                </a>
              </li>
              <li className="dropdown hidden-xs">
                <a className="dropdown-toggle" role="button" aria-expanded="false">
                  <span className="icon s7-help1"></span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>);
  }
}
