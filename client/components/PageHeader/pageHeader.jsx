import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import './index.less';

const { Header } = Layout;

export default class PageHeader extends Component {
  static propTypes = {
    children: PropTypes.any,
  }
  render() {
    const { children } = this.props;
    return (
      <Header className="welo-page-header">
        {children}
      </Header>
    );
  }
}
