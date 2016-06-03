import React from 'react';
import { Table } from 'ant-ui';

const columns = [
  {
    title: '合作伙伴',
    dataIndex: 'partner',
    key: 'partner'
  },
  {
    title: '代码',
    dataIndex: 'parter_code',
    key: 'partner_code'
  },
  {
    title: '关系类型',
    dataIndex: 'partnerships',
    key: 'partnerships'
  },
  {
    title: '创建日期',
    dataIndex: 'create_time',
    key: 'create_time'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    render(_, record) {
      return (
        <a>邀请加入</a>
      );
    }
  }
];

const rowSelection = {
  onChange() {}
};

export default function ToInviteList(props) {
  return (
    <Table columns={columns} dataSource={[{partner: 'zank'}]} rowSelection={rowSelection}/>
  );
}
