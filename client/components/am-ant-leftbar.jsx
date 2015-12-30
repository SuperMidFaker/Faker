import React, { PropTypes } from 'react';
import NavLink from '../../reusable/components/nav-link';
import { Menu } from '../../reusable/ant-ui';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const MenuItemGroup = Menu.ItemGroup;

export default class AmLeftSidebar extends React.Component {
  static propTypes = {
    links: PropTypes.array
  }
  constructor(...args) {
    super(...args);
    this.state = {
      openedKey: []
    };
  }
  handleClick(ev) {
    this.setState({
      openedKey: ev.keyPath.slice(1)
    });
  }
  render() {
    const { links } = this.props;
    return (
      <div className="am-left-sidebar">
      {/*
        <div className="am-scroller nano">
        <div className="nano-content">
       */}
        <Menu prefixCls="am-sidebar" onClick={(ev) => this.handleClick(ev)} mode="vertical">
          <SubMenu key="sub1" title={<span><i className="icon anticon anticon-mail" /><span>导航一</span></span>}>
            <MenuItemGroup title="分组1">
              <Menu.Item key="1">选项1</Menu.Item>
              <Menu.Item key="2">选项2</Menu.Item>
            </MenuItemGroup>
              <MenuItemGroup title="分组2">
              <Menu.Item key="3">选项3</Menu.Item>
              <Menu.Item key="4">选项4</Menu.Item>
            </MenuItemGroup>
          </SubMenu>
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
                      title={<span><i className={ 'icon ' + link.icon }></i><span>{link.text}</span></span>}>
                  {
                    link.sublinks.map(sub => {
                      return (<MenuItem key={sub.key}>
                        <NavLink to={ sub.path }>
                          <span>{sub.text}</span>
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
