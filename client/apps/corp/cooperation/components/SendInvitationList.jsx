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
    title: '邀请对方成为',
    dataIndex: 'partnerships',
    key: 'partnerships'
  },
  {
    title: '发出时间',
    dataIndex: 'create_time',
    key: 'create_time'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    render() {
      return (
        <a>取消邀请</a>
      );
    }
  }
];

const rowSelection = {
  onChange() {}
};

export default function SendInvitation() {
  return (
    <Table columns={columns} dataSource={[{partner: 'zank'}]} rowSelection={rowSelection}/>
  );
}
