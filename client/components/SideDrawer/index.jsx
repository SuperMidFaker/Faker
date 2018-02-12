import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import './index.less';

const { Sider } = Layout;

export default class SideDrawer extends React.Component {
  static defaultProps = {
    width: 300,
  }
  static propTypes = {
    width: PropTypes.number,
    children: PropTypes.node,
  }
  state = {
    collapsed: false,
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  render() {
    const { children, width } = this.props;
    return (
      <Sider
        width={width}
        collapsible
        collapsedWidth={0}
        collapsed={this.state.collapsed}
        className="welo-side-drawer"
      >
        {children}
        <a className="welo-side-drawer-trigger-wrapper" onClick={this.toggle}>
          <i className={`drawer-trigger ${this.state.collapsed ? 'right' : 'left'}`} />
        </a>
      </Sider>
    );
  }
}
