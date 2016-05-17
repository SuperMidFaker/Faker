import React, { PropTypes } from 'react';
import { Table, Button } from 'ant-ui';
import { Link } from 'react-router';

const columns = [
  {
    title: '司机姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '手机号码',
    dataIndex: 'phone',
    key: 'type'
  },
  {
    title: '指派车辆',
    dataIndex: 'length',
    key: 'length'
  },
  {
    title: '指派车辆',
    dataIndex: 'load_weight',
    key: 'load_weight'
  },
  {
    title: '已分配订单',
    dataIndex: 'load_volume',
    key: 'load_volume'
  },
  {
    title: '在途订单',
    dataIndex: 'driver',
    key: 'driver'
  },
  {
    title: '连接类型',
    dataIndex: 'connect_type',
    key: 'connect_type'
  },
  {
    title: '是否可用',
    dataIndex: 'status',
    key: 'adfa'
  },
  {
    title: '是否可信',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
  },
  {
    title: '操作',
    dataIndex: 'operations',
    key: 'operations',
    render: (_, record) => (
      <span>
        <Link to={`/edit_driver/${record.id}`}>修改</Link>
      </span>
    )
  }
];

const rowSelection = {
  onSelect() {
  }
};

export default function DriverList(props) {
  const { dataSource, onAddDriverBtnClicked } = props;
  return (
    <div>
      <div style={{marginBottom: 16}}>
        <Button type="primary" size="large" onClick={onAddDriverBtnClicked}>新建司机</Button>
      </div>
      <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} />
    </div>
  );
}

DriverList.propTyps = {
  dataSource: PropTypes.array,
  onAddDriverBtnClicked: PropTypes.func.isRequired, // 点击新建司机按钮后执行的回调函数
};
