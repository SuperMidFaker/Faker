import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Tooltip } from 'antd';
import './style.less';

const { Sider } = Layout;

export default class Drawer extends React.Component {
  static defaultProps = {
    width: 300,
    top: false,
  }
  static propTypes = {
    top: PropTypes.bool,
    width: PropTypes.number,
    children: PropTypes.node,
    onCollapseChange: PropTypes.func,
  }
  state = {
    collapsed: false,
  }
  toggle = () => {
    const { onCollapseChange } = this.props;
    this.setState({
      collapsed: !this.state.collapsed,
    });
    if (onCollapseChange) {
      onCollapseChange(this.state.collapsed);
    }
  }
  render() {
    const { children, width, top } = this.props;
    const { collapsed } = this.state;
    return (
      top ?
        <div
          className={`welo-top-drawer ${collapsed ? 'collapsed' : ''}`}
        >
          <div className="welo-top-drawer-content">
            {children}
          </div>
          <Tooltip title={collapsed ? '展开' : '收起'} placement="bottom" mouseEnterDelay={1.5} mouseLeaveDelay={0}>
            <a className="welo-top-drawer-trigger-wrapper" onClick={this.toggle}>
              <i className={`drawer-trigger ${collapsed ? 'down' : 'up'}`} />
            </a>
          </Tooltip>
        </div> :
        <Sider
          width={width}
          collapsible
          collapsedWidth={0}
          collapsed={this.state.collapsed}
          className="welo-side-drawer"
        >
          <div className="welo-side-drawer-inner">
            {children}
          </div>
          <Tooltip title={collapsed ? '展开' : '收起'} placement="right" mouseEnterDelay={1.5} mouseLeaveDelay={0}>
            <a className="welo-side-drawer-trigger-wrapper" onClick={this.toggle}>
              <i className={`drawer-trigger ${collapsed ? 'right' : 'left'}`} />
            </a>
          </Tooltip>
        </Sider>
    );
  }
}
