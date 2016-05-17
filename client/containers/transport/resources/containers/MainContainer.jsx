import React, { Component } from 'react';
import { Tabs } from 'ant-ui';
import CarListContainer from './CarListContainer.jsx';
import DriverListContainer from './DriverListContainer.jsx';

const TabPane = Tabs.TabPane;

export default class MainContainer extends Component {
  render() {
    return (
      <Tabs defaultActiveKey="1">
        <TabPane key="1" tab="车辆管理">
          <CarListContainer />
        </TabPane>
        <TabPane key="2" tab="司机管理">
          <DriverListContainer />
        </TabPane>
        <TabPane key="3" tab="节点管理">节点管理</TabPane>
        <TabPane key="4" tab="价格管理">价格管理</TabPane>
        <TabPane key="5" tab="线路管理">线路管理</TabPane>
      </Tabs>
    );
  }
}
