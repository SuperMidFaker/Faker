import React, { PropTypes } from 'react';
import { Menu } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from './nav-link';
import './am-ant-leftbar.less';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

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

export default class AmLeftSidebar extends React.Component {
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
      })),
    })).isRequired,
  }
  state = {
    selectedKeys: [],
    openedKey: [],
  };

  componentWillMount() {
    this.setOpenSelectedKeys(this.props.location.pathname);
  }
  componentWillReceiveProps(nextProps) {
    this.setOpenSelectedKeys(nextProps.location.pathname);
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
    return (
      <QueueAnim type={['left', 'right']} duration={600}>
      <div className="am-left-sidebar">
        <Menu onSelect={this.handleMenuSelect} selectedKeys={this.state.selectedKeys}
          onClick={this.handleClick} mode="vertical" theme="dark"
        >
        {
          links.map((link) => {
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
                    link.sublinks.map((sub) => {
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
      </QueueAnim>
    );
  }
}
