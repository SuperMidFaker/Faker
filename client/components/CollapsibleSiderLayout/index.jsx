import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import NavLink from '../NavLink';
import './index.less';

const { Sider } = Layout;
const { SubMenu } = Menu;
const MenuItem = Menu.Item;
const MenuItemGroup = Menu.ItemGroup;

function isInclusivePath(pathTarget, pathSource) {
  let pathA = pathSource;
  if (pathA.charAt(pathA.length - 1) !== '/') {
    pathA = `${pathA}/`;
  }
  let pathB = pathTarget;
  if (pathB.charAt(pathB.length - 1) !== '/') {
    pathB = `${pathB}/`;
  }
  // '/a/' 只判断相等情况
  return pathA === pathB ||
    (pathA.split('/').length > 3 && pathB.indexOf(pathA) === 0);
}

export default class CollapsibleSiderLayout extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      single: PropTypes.bool,
      bottom: PropTypes.bool,
      key: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      sublinks: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        group: PropTypes.string,
      })),
    })).isRequired,
    appMenus: PropTypes.arrayOf(PropTypes.shape({
      app_name: PropTypes.string,
      url: PropTypes.string,
    })),
    showLogo: PropTypes.bool,
  }
  state = {
    selectedKeys: [],
    openedKey: [],
    collapsed: false,
  };

  componentWillMount() {
    this.setOpenSelectedKeys(this.props.location.pathname);
    if (typeof window !== 'undefined' && window.localStorage) {
      const menuSider = window.localStorage.getItem('menuSider');
      if (menuSider !== null) {
        this.setState({ collapsed: JSON.parse(menuSider).collapsed });
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setOpenSelectedKeys(nextProps.location.pathname);
  }
  onCollapse = (collapsed) => {
    this.setState({ collapsed });
    if (window.localStorage) {
      let menuSider = window.localStorage.getItem('menuSider');
      if (menuSider) {
        menuSider = { ...JSON.parse(menuSider), collapsed };
      } else {
        menuSider = { collapsed };
      }
      window.localStorage.setItem('menuSider', JSON.stringify(menuSider));
    }
  }
  setOpenSelectedKeys(path) {
    for (let i = 0; i < this.props.links.length; i++) {
      const link = this.props.links[i];
      if (link.single) {
        if (isInclusivePath(path, link.path)) {
          this.setState({
            openedKey: [],
            selectedKeys: [link.key],
          });
          return;
        }
      } else {
        for (let j = 0; j < link.sublinks.length; j++) {
          const sublink = link.sublinks[j];
          if (isInclusivePath(path, sublink.path)) {
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
  handleAppClick = (url) => {
    const win = window.open(url, '_blank');
    win.focus();
  }
  render() {
    const links = this.props.links.filter(l => !l.invisible);
    const { childContent, showLogo, appMenus } = this.props;
    return (
      <Layout className="ant-layout-wrapper">
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          width={176}
          className="left-sider"
        >
          {showLogo ? <div className="layout-logo" /> : ''}
          <Menu
            mode="inline"
            theme="dark"
            onSelect={this.handleMenuSelect}
            selectedKeys={this.state.selectedKeys}
            onClick={this.handleClick}
          >
            {
              links.map((link) => {
                const bottomMenuItem = link.bottom ? 'bottom-menu-item' : '';
                if (link.single) {
                  return (
                    <MenuItem key={link.key} disabled={link.disabled} className={bottomMenuItem}>
                      <NavLink to={link.path}>
                        <i className={`icon ${link.icon}`} />
                        <span className="nav-text">{link.text}</span>
                      </NavLink>
                    </MenuItem>);
                }
                  let subMenuItems;
                  const isGrouped = link.sublinks.filter(sub =>
                    sub.group).length === link.sublinks.length;
                  if (isGrouped) {
                    const groupLinks = [];
                    for (let i = 0; i < link.sublinks.length; i++) {
                      const sublink = link.sublinks[i];
                      let unfound = true;
                      for (let j = 0; j < groupLinks.length; j++) {
                        if (groupLinks[j].group === sublink.group) {
                          groupLinks[j].links.push(sublink);
                          unfound = false;
                          break;
                        }
                      }
                      if (unfound) {
                        groupLinks.push({
                          group: sublink.group,
                          links: [sublink],
                        });
                      }
                    }
                    subMenuItems = groupLinks.map(gl => (
                      <MenuItemGroup title={gl.group} key={gl.group}>
                        {
                          gl.links.map(gll => (
                            <MenuItem key={gll.key} disabled={gll.disabled}>
                              <NavLink to={gll.path}>
                                {gll.icon && <i className={`icon ${gll.icon}`} />}
                                <span className="nav-text">{gll.text}</span>
                              </NavLink>
                            </MenuItem>))
                        }
                      </MenuItemGroup>
                    ));
                  } else {
                    subMenuItems = link.sublinks.map(sub => (
                      <MenuItem key={sub.key} disabled={sub.disabled}>
                        <NavLink to={sub.path}>
                          {sub.icon && <i className={`icon ${sub.icon}`} />}
                          <span className="nav-text">{sub.text}</span>
                        </NavLink>
                      </MenuItem>));
                  }
                  return (
                    <SubMenu
                      key={link.key}
                      disabled={link.disabled}
                      className={this.state.openedKey[0] === link.key ? 'ant-menu-submenu-selected' : ''}
                      title={<div><i className={`icon ${link.icon}`} /><span className="nav-text">{link.text}</span></div>}
                    >
                      { subMenuItems }
                    </SubMenu>
                  );
              })
            }
            {
              appMenus.map((app) => {
                if (app.single) {
                  return (
                    <MenuItem key={app.key} disabled={app.disabled}>
                      <NavLink onChange={() => this.handleAppClick(app.path)}>
                        <i className={`icon ${app.icon}`} />
                        <span className="nav-text">{app.text}</span>
                      </NavLink>
                    </MenuItem>
                  );
                }
                const subMenuItems = appMenus[0].sublinks.map(sub => (
                  <MenuItem key={sub.key} disabled={sub.disabled}>
                    <NavLink onChange={() => this.handleAppClick(sub.path)}>
                      {sub.icon && <i className={`icon ${sub.icon}`} />}
                      <span className="nav-text">{sub.text}</span>
                    </NavLink>
                  </MenuItem>));
                return (
                  <SubMenu
                    key={app.key}
                    disabled={app.disabled}
                    className={this.state.openedKey[0] === app.key ? 'ant-menu-submenu-selected' : ''}
                    title={<div><i className={`icon ${app.icon}`} /><span className="nav-text">{app.text}</span></div>}
                  >
                    { subMenuItems }
                  </SubMenu>
                );
              })

            }
          </Menu>
        </Sider>
        <Layout>
          {childContent}
        </Layout>
      </Layout>
    );
  }
}
