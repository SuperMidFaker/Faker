import React, { PropTypes } from 'react';
import { Popover } from '../../reusable/ant-ui';
import NavLink from '../../reusable/components/nav-link';
import AmUserNav from './am-user-nav';
import ModuleLayout from './module-layout';
import {DEFAULT_MODULES} from '../../universal/constants';
export default class AmNavBar extends React.Component {
  static propTypes = {
    locationPath: PropTypes.string,
    barTitle: PropTypes.string
  }
  render() {
    const moduleName = this.props.locationPath && this.props.locationPath.split('/')[1];
    return (
      <nav className="navbar navbar-default navbar-fixed-top am-top-header">
        <div className="container-fluid">
          <div className="navbar-header">
            {/* mobile header
              <div className="page-title">
                <span>仓管家</span>
              </div>
              <a className="am-toggle-left-sidebar navbar-toggle collapsed">
                <span className="icon-bar"><span></span><span></span><span></span></span>
              </a>
            */}
            <NavLink to="/" className="navbar-brand" />
          </div>
          {/* mobile collapse
          <a data-toggle="collapse" data-target="#am-navbar-collapse" className="am-toggle-top-header-menu collapsed">
            <span className="icon s7-angle-down"></span>
          </a>
          */}
          <div id="am-navbar-collapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav am-nav-right">
              <li className="dropdown">
              { moduleName &&
                <Popover placement="bottomLeft" trigger="click" overlay={<ModuleLayout />}>
                  <a role="button" aria-expanded="false" className="dropdown-toggle">
                    {DEFAULT_MODULES[moduleName].text}
                    <span className="angle-down s7-angle-down"></span>
                  </a>
                </Popover>
              }
              </li>
              <li className="dropdown">
                <a role="button" aria-expanded="false" className="dropdown-toggle">
                  <span>{this.props.barTitle}</span>
                </a>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right am-user-nav">
              <AmUserNav />
            </ul>
            <ul className="nav navbar-nav navbar-right am-icons-nav">
              <li className="dropdown">
                <a className="dropdown-toggle" aria-expanded="false" role="button">
                  <span className="icon s7-comment"></span>
                </a>
              </li>
              <li className="dropdown">
                <a className="dropdown-toggle" role="button" aria-expanded="false">
                  <span className="icon s7-bell"></span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>);
  }
}
