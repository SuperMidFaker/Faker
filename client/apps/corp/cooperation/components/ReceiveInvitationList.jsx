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
    title: '邀请我方成为',
    dataIndex: 'partnerships',
    key: 'partnerships'
  },
  {
    title: '收到时间',
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
    render(_, record) {
      return (
        <span>
          <a>接受</a>
          <span className="ant-divider"></span>
          <a>拒绝</a>
        </span>
      );
    }
  }
];

const rowSelection = {
  onChange() {}
};

export default function ReceiveInvitationList(props) {
  return (
    <Table columns={columns} dataSource={[{partner: 'zank'}]} rowSelection={rowSelection}/>
  );
}
