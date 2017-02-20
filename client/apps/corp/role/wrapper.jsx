import React, { PropTypes } from 'react';
import { Breadcrumb, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
const { Header, Content } = Layout;

export default class Wrapper extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              角色权限
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content">
          {this.props.children}
        </Content>
      </QueueAnim>
    );
  }
}
