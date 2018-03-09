import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Tabs } from 'antd';
import './style.less';

const { Header } = Layout;
const { TabPane } = Tabs;

export default class PageHeader extends Component {
  static propTypes = {
    children: PropTypes.node,
  }
  onChange = (key) => {
    if (this.props.onTabChange) {
      this.props.onTabChange(key);
    }
  };
  render() {
    const { children, tabList } = this.props;
    const tabDefaultValue = tabList && tabList.filter(item => item.default)[0];
    return (
      <Header className="welo-page-header">
        {children}
        {
          tabList &&
          tabList.length &&
          <Tabs
            defaultActiveKey={(tabDefaultValue && tabDefaultValue.key)}
            onChange={this.onChange}
          >
            {
              tabList.map(item => <TabPane tab={item.tab} key={item.key} />)
            }
          </Tabs>
        }
      </Header>
    );
  }
}
