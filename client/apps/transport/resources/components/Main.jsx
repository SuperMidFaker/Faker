import React, { PropTypes } from 'react';
import { Menu, Spin } from 'ant-ui';
import CarListContainer from '../containers/CarListContainer';
import DriverListContainer from '../containers/DriverListContainer';
import NodeListContainer from '../containers/NodeListContainer';

const MenuItem = Menu.Item;

const styles = {
  show: {
    display: 'block'
  },
  hidden: {
    display: 'none'
  }
};

export default function Main(props) {
  const { selectedKeys, onClick, loading } = props;
  const [selectedKey] = selectedKeys;
  const content = [<CarListContainer />, <DriverListContainer />, <NodeListContainer />]
     .map((container, index) => <div style={ parseInt(selectedKey) === index ? styles.show: styles.hidden} key={index}>{container}</div>);
  return (
    <div>
      <Menu mode="horizontal" selectedKeys={selectedKeys} onClick={onClick}>
        <MenuItem key="0">车辆管理</MenuItem>
        <MenuItem key="1">司机管理</MenuItem>
        <MenuItem key="2">节点管理</MenuItem>
        <MenuItem key="3">价格管理</MenuItem>
        <MenuItem key="4">线路管理</MenuItem>
      </Menu>
      <Spin spinning={loading}>
        {content}
      </Spin>
    </div>

  );
}

Main.propTyps = {
  selectedKeys: PropTypes.array.isRequired,  // 选中的menuItem keys
  onClick: PropTypes.func.isRequired,        // itemItem点击后执行的回调函数,
  loading: PropTypes.bool.isRequired,        // 表示是否正在加载数据
};
