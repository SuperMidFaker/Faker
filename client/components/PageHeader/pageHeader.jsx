import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import Title from './title';
import './style.less';

const { Header } = Layout;

export default class PageHeader extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.node,
    breadcrumb: PropTypes.arrayOf(PropTypes.node),
    menus: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, menu: PropTypes.node })),
  }
  onChange = (ev) => {
    if (this.props.onTabChange) {
      this.props.onTabChange(ev.key);
    }
  };
  render() {
    const {
      children, title, breadcrumb, menus,
    } = this.props;
    const defaultTab = menus && (menus.filter(item => item.default)[0] || menus[0]);
    const tb = title ? [title] : (breadcrumb || []);
    return (
      <Header className="welo-page-header">
        <div className="welo-page-header-wrapper">
          {(title || breadcrumb) &&
            <Title breadcrumb={tb} />
          }
          {menus && menus.length &&
            <Menu
              onClick={this.onChange}
              defaultSelectedKeys={(defaultTab && [defaultTab.key])}
              mode="horizontal"
            >
              {menus.map(item => <Menu.Item key={item.key} >{item.menu}</Menu.Item>)}
            </Menu>
          }
        </div>
        {children}
      </Header>
    );
  }
}
