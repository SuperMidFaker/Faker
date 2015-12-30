import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import NavLink from '../../reusable/components/nav-link';
import AmUserNav from '../components/am-user-nav';

@connect(
  state => ({
    username: state.account.username
  })
)
export default class Module extends React.Component {
  static propTypes = {
    username: PropTypes.string,
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <nav className="navbar navbar-default navbar-fixed-top am-top-header">
          <div className="container-fluid">
            <div className="navbar-header">
            {/* mobile header */}
              <div className="page-title">
                <span>仓管家</span>
              </div>
              <a className="am-toggle-left-sidebar navbar-toggle collapsed">
                <span className="icon-bar"><span></span><span></span><span></span></span>
              </a>
            {/* mobile header */}
              <NavLink to="/home" className="navbar-brand" />
            </div>
            {/* mobile collapse */}
            <a data-toggle="collapse" data-target="#am-navbar-collapse" className="am-toggle-top-header-menu collapsed">
              <span className="icon s7-angle-down"></span>
            </a>
            {/* mobile collapse */}
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
        </nav>
        {this.props.children}
      </div>);
  }
}
