import React, { PropTypes } from 'react';
import { Layout } from 'antd';
const { Content } = Layout;

export default class Wrapper extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };
  render() {
    return (
      <div>
        <Content className="main-content">
          {this.props.children}
        </Content>
      </div>
    );
  }
}
