import React, { PropTypes } from 'react';
import NavLink from '../../reusable/components/nav-link';
import { Menu } from 'ant-ui';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

function hoverAmSubmenu() {
  // hacky: make the submenu ul visible at the bottom of page
  /* eslint-disable */
  $('.am-sidebar-submenu').hover(function () {
    const submenu = $(this);
    const submenuUL = submenu.find('ul');
    if (submenu[0].offsetTop < window.innerHeight/2) {
      submenuUL.css('top', 0);
    } else {
      submenuUL.css('bottom', 0);
    }
  })
}
function updateDimensions() {
  hoverAmSubmenu();
}
function isEqualPath(pathA, pathB) {
  if (pathA.charAt(pathA.length - 1 ) !== '/') {
    pathA = `${pathA}/`;
  }
  if (pathB.charAt(pathB.length - 1 ) !== '/') {
    pathB = `${pathB}/`;
  }
  return pathA === pathB;
}
export default class AmLeftSidebar extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    links: PropTypes.array.isRequired
    /* {
     *   single:
     *   key:
     *   path:
     *   icon:
     *   text:
     *   sublinks: [{
     *     key:
     *     path:
     *     text:
     *   }]
     * }
     */
  }
  state = {
    selectedKeys: [],
    openedKey: []
  };
  setOpenSelectedKeys(path) {
    let openedKey = [];
    let selectedKeys = [];
    for (let i = 0; i < this.props.links.length; i++) {
      const link = this.props.links[i];
      if (link.single) {
        if (isEqualPath(link.path, path)) {
          selectedKeys = [link.key];
          break;
        }
      } else {
        let j = 0;
        for (; j < link.sublinks.length; j++) {
          const sublink = link.sublinks[j];
          if (isEqualPath(sublink.path, path)) {
            openedKey = [link.key];
            selectedKeys = [sublink.key];
            break;
          }
        }
        if (j < link.sublinks.length) {
          break;
        }
      }
    }
    this.setState({ openedKey, selectedKeys });
  }
  componentWillReceiveProps(nextProps) {
    this.setOpenSelectedKeys(nextProps.location.pathname);
  }
  componentDidMount() {
    hoverAmSubmenu();
    window.addEventListener("resize", updateDimensions);
    this.setOpenSelectedKeys(this.props.location.pathname);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", updateDimensions);
  }
  handleMenuSelect = ({ selectedKeys }) => {
    this.setState({ selectedKeys });
  }
  handleClick = (ev) => {
    // keyPath ['subkey', 'menukey']
    this.setState({
      openedKey: ev.keyPath.slice(1)
    });
  }
  render() {
    const links = this.props.links.filter(l => !l.invisible);
    return (
      <div className="am-left-sidebar">
      {/*
        <div className="am-scroller nano">
        <div className="nano-content">
       */}
        <Menu onSelect={this.handleMenuSelect} selectedKeys={this.state.selectedKeys}
          prefixCls="am-sidebar" onClick={ this.handleClick } mode="vertical"
        >
        {
          links.map(link => {
            if (link.single) {
              return (<MenuItem key={link.key}>
                <NavLink to={ link.path }>
                  <i className={ 'icon ' + link.icon }></i>
                  <span>{link.text}</span>
                </NavLink>
              </MenuItem>);
            } else {
              return (
                <SubMenu key={link.key} className={this.state.openedKey[0] === link.key ? 'am-sidebar-submenu-expanded' : ''}
                      title={<div><i className={ 'icon ' + link.icon }></i><span>{link.text}</span></div>}>
                  {
                    link.sublinks.map(sub => {
                      return (<MenuItem key={sub.key}>
                        <NavLink to={ sub.path }>
                          {sub.text}
                        </NavLink>
                      </MenuItem>);
                    })
                  }
                  </SubMenu>
              );
            }
          })
        }
        </Menu>
        {/*
        </div>
        </div>
       */}
      {/*
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
         */}
      </div>
    );
  }
}
