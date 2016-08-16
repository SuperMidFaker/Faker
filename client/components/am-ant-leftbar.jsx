import React, { PropTypes } from 'react';
import NavLink from './nav-link';
import { Menu } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
import './am-ant-leftbar.less';

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
  });
  /* eslint-enable */
}
function updateDimensions() {
  hoverAmSubmenu();
}
function isEqualPath(pathA, pathB) {
  /* eslint-disable */
  if (pathA.charAt(pathA.length - 1) !== '/') {
    pathA = `${pathA}/`;
  }
  if (pathB.charAt(pathB.length - 1) !== '/') {
    pathB = `${pathB}/`;
  }

  /* eslint-enable */
  return pathA === pathB;
}
export default class AmLeftSidebar extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    links: PropTypes.array.isRequired,
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
    openedKey: [],
  };

  componentDidMount() {
    hoverAmSubmenu();
    window.addEventListener('resize', updateDimensions);
    this.setOpenSelectedKeys(this.props.location.pathname);
  }
  componentWillReceiveProps(nextProps) {
    this.setOpenSelectedKeys(nextProps.location.pathname);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', updateDimensions);
  }
  setOpenSelectedKeys(path) {
    for (let i = 0; i < this.props.links.length; i++) {
      const link = this.props.links[i];
      if (link.single) {
        if (isEqualPath(link.path, path)) {
          this.setState({
            openedKey: [],
            selectedKeys: [link.key],
          });
          return;
        }
      } else {
        for (let j = 0; j < link.sublinks.length; j++) {
          const sublink = link.sublinks[j];
          if (isEqualPath(sublink.path, path)) {
            this.setState({
              openedKey: [link.key],
              selectedKeys: [sublink.key],
            });
            return;
          }
        }
      }
    }
  }
  handleMenuSelect = ({ selectedKeys }) => {
    this.setState({ selectedKeys });
  }
  handleClick = (ev) => {
    // keyPath ['subkey', 'menukey']
    this.setState({
      openedKey: ev.keyPath.slice(1),
    });
  }
  render() {
    const links = this.props.links.filter(l => !l.invisible);
    return (
      <div className="am-left-sidebar">
        <Menu onSelect={this.handleMenuSelect} selectedKeys={this.state.selectedKeys}
          onClick={this.handleClick} mode="vertical" theme="dark"
        >
        {
          links.map(link => {
            if (link.single) {
              return (<MenuItem key={link.key}>
                <NavLink to={link.path}>
                  <i className={`icon  ${link.icon}`} />
                  <span>{link.text}</span>
                </NavLink>
              </MenuItem>);
            } else {
              return (
                <SubMenu key={link.key} className={this.state.openedKey[0] === link.key ? 'ant-menu-submenu-selected' : ''}
                  title={<div><i className={`icon  ${link.icon}`} /><span>{link.text}</span></div>}
                >
                  {
                    link.sublinks.map(sub => {
                      return (<MenuItem key={sub.key}>
                        <NavLink to={sub.path}>
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
      </div>
    );
  }
}
