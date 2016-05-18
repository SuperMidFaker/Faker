import React, { PropTypes } from 'react';
import { Menu } from 'ant-ui';
import CarListContainer from '../containers/CarListContainer.jsx';
import DriverListContainer from '../containers/DriverListContainer.jsx';

const MenuItem = Menu.Item;

export default function Main(props) {
  const { selectedKeys, onClick } = props;
  return (
    <div>
      <Menu mode="horizontal" selectedKeys={selectedKeys} onClick={onClick}>
        <MenuItem key="0">车辆管理</MenuItem>
        <MenuItem key="1">司机管理</MenuItem>
        <MenuItem key="2">节点管理</MenuItem>
        <MenuItem key="3">价格管理</MenuItem>
        <MenuItem key="4">线路管理</MenuItem>
      </Menu>
      <div className="main-content">
        <div className="page-body fixed">
          <div className="panel-body body-responsive">
            <CarListContainer />
            <DriverListContainer />
          </div>
        </div>
      </div>
    </div>

  );
}

Main.propTyps = {
  selectedKeys: PropTypes.array.isRequired,  // 选中的menuItem keys
  onClick: PropTypes.func.isRequired,        // itemItem点击后执行的回调函数
};
