import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

export default function ContentWrapper(props) {
  return (
    <Content className="main-content">
      <div className="page-body">
        <div className="toolbar" />
        <div className="panel-body">
          {props.children}
        </div>
      </div>
    </Content>
  );
}
