import React, { PropTypes } from 'react';
import NavLink from './nav-link';

export default class AmLeftSidebar extends React.Component {
  static propTypes = {
    navPath: PropTypes.string,
    links: PropTypes.array
  }
  render() {
    const { links, navPath } = this.props;
    return (
      <div className="am-left-sidebar">
        <div className="content">
          <div className="am-logo"></div>
          <ul className="sidebar-elements">
          {
            links.map(link => {
              if (link.single) {
                return (<li className={ navPath.indexOf(link.path) >= 0 ? 'active' : '' } key={ link.key }>
                  <NavLink to={ link.path }>
                    <i className={ 'icon ' + link.icon }></i>
                    <span>{ link.text }</span>
                  </NavLink>
                </li>);
              } else {
                return (<li className={ 'parent' + (navPath.indexOf(link.path) >= 0 ? ' active' : '') } key={ link.key }>
                  <a href="#"><i className={ 'icon ' + link.icon }></i><span>{ link.text }</span></a>
                  <ul className="sub-menu">
                  {
                    link.subLinks.map(sublink => {
                      return (<li className={ navPath.indexOf(sublink.path) >= 0 ? 'active' : '' } key={ sublink.key }>
                                <NavLink to={ sublink.path }>
                                {sublink.text}
                                </NavLink></li>);
                    })
                  }
                  </ul>
                </li>);
              }
            })
          }
          </ul>
        </div>
      </div>
    );
  }
}
