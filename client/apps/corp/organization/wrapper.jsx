import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';

const { Header, Content } = Layout;

export default class OrganizationWrapper extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
  };
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              组织机构
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
