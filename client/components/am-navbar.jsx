import React, { PropTypes } from 'react';
import NavLink from '../../reusable/components/nav-link';
import AmUserNav from '../components/am-user-nav';
export default class AmNavBar extends React.Component {
  static propTypes = {
    modules: PropTypes.number // services dropdown not shown in home
    // corpname
  }
  render() {
    return (
      <nav className="navbar navbar-default navbar-fixed-top am-top-header">
        <div className="container-fluid">
          <div className="navbar-header">
            <NavLink to="/" className="navbar-brand" />
          </div>
          <div id="am-navbar-collapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav am-nav-right">
              <li className="dropdown">
                <a><span>Services</span><span className="angle-down s7-angle-down"></span></a>
              </li>
              <li className="dropdown"><a href="#">杭州趣摩物流有限公司</a></li>
            </ul>
            <AmUserNav />
            <ul className="nav navbar-nav navbar-right am-icons-nav">
              <li className="dropdown"><a data-toggle="dropdown" role="button"><span className="icon s7-comment"></span></a></li>
              <li className="dropdown">
                <a data-toggle="dropdown" role="button" aria-expanded="false"><span className="icon s7-bell"></span></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>);
  }
}
