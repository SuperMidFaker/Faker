import React, { PropTypes } from 'react';
import { Menu } from 'ant-ui';
import CustomerListContainer from '../containers/CustomerListContainer';

const MenuItem = Menu.Item;

export default function Main(props) {
  return (
    <div>
      <Menu selectedKeys={['0']} mode="horizontal">
        <MenuItem key="0">客户</MenuItem>
        <MenuItem key="1">供应商</MenuItem>
        <MenuItem key="2">关联企业</MenuItem>
        <MenuItem key="3">物流供应商</MenuItem>
        <MenuItem key="4">邀请伙伴</MenuItem>
      </Menu>
      <CustomerListContainer />
    </div>
  );
}
