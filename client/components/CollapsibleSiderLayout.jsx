import React, { PropTypes } from 'react';
import { Layout, Menu } from 'antd';
import NavLink from './nav-link';
import './CollapsibleSiderLayout.less';

const { Sider } = Layout;
const SubMenu = Menu.SubMenu;
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

export default class CollapsibleSiderLayout extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      single: PropTypes.bool,
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
    showLogo: PropTypes.bool,
  }
  state = {
    selectedKeys: [],
    openedKey: [],
    collapsed: true,
    menuMode: 'vertical',
  };

  componentWillMount() {
    this.setOpenSelectedKeys(this.props.location.pathname);
  }
  componentWillReceiveProps(nextProps) {
    this.setOpenSelectedKeys(nextProps.location.pathname);
  }
  onCollapse = (collapsed) => {
    this.setState({ collapsed });
    if (collapsed) {
      this.setState({ menuMode: 'vertical' });
    } else {
      // TODO inline mode
      this.setState({ menuMode: 'inline' });
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
  render() {
    const links = this.props.links.filter(l => !l.invisible);
    const childContent = this.props.childContent;
    const showLogo = this.props.showLogo;
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
          <Menu mode={this.state.menuMode} theme="dark" onSelect={this.handleMenuSelect}
            selectedKeys={this.state.selectedKeys}
            onClick={this.handleClick}
          >
            {
              links.map((link) => {
                if (link.single) {
                  return (
                    <MenuItem key={link.key} disabled={link.disabled}>
                      <NavLink to={link.path}>
                        <i className={`icon ${link.icon}`} />
                        <span className="nav-text">{link.text}</span>
                      </NavLink>
                    </MenuItem>);
                } else {
                  let subMenuItems;
                  const isGrouped = link.sublinks.filter(sub => sub.group).length === link.sublinks.length;
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
                            <MenuItem key={gll.key}>
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
                    <SubMenu key={link.key}
                      disabled={link.disabled}
                      className={this.state.openedKey[0] === link.key ? 'ant-menu-submenu-selected' : ''}
                      title={<div><i className={`icon ${link.icon}`} /><span className="nav-text">{link.text}</span></div>}
                    >
                      { subMenuItems }
                    </SubMenu>
                  );
                }
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
