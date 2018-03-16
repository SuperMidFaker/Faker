import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import SearchBox from 'client/components/SearchBox';
import './style.less';

const { Sider } = Layout;

export default class ListContentLayout extends PureComponent {
  static props ={
    list: PropTypes.node,
    title: PropTypes.node,
    action: PropTypes.node,
    onSearch: PropTypes.func,
  }
  render() {
    const {
      title, children, list, action, onSearch,
    } = this.props;
    return (
      <Layout>
        <Sider
          width={320}
          className="list-column"
          key="sider"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="list-column-header">
            <span className="list-column-header-title">{title}</span>
            <span className="list-column-header-action">{action}</span>
          </div>
          {onSearch && <div className="list-column-search-wrapper">
            <SearchBox
              onSearch={onSearch}
              width="100%"
            />
          </div>}
          <div className={`list-column-body ${onSearch && 'list-column-body-has-search'}`}>
            {list}
          </div>
        </Sider>
        <Layout className="content-column">
          {children}
        </Layout>
      </Layout>
    );
  }
}
