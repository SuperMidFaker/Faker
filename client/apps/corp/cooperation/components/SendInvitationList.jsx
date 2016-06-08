import React, { PropTypes } from 'react';
import { Table } from 'ant-ui';
import moment from 'moment';
import { addUniqueKeys } from 'client/util/dataTransform';
import { mapPartnerships } from '../util/dataMapping';

const rowSelection = {
  onChange() {}
};

export default function SendInvitation(props) {
  const { onCancelInviteBtnClick, sendInvitations } = props;
  const columns = [
    {
      title: '合作伙伴',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '邀请对方成为',
      dataIndex: 'partnerships',
      key: 'partnerships',
      render(_, record) {
        return (
          <span>{mapPartnerships(record.partnerships)}</span>
        );
      }
    },
    {
      title: '发出时间',
      dataIndex: 'created_date',
      key: 'created_date',
      render(_, record) {
        return (
          <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render(_, record) {
        switch (record.status) {
          case 0:
            return (<span>待定</span>);
          case 1:
            return (<span>已接受</span>);
          case 2:
            return (<span>已拒绝</span>);
          case 3:
            return (<span>已取消</span>);
          default:
            return null;
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render(_, record) {
        if (record.status === 0) {
          return (<a onClick={() => onCancelInviteBtnClick(record.id)}>取消邀请</a>);
        } else {
          return null;
        }
      }
    }
  ];
  return (
    <Table columns={columns} dataSource={addUniqueKeys(sendInvitations)} rowSelection={rowSelection}/>
  );
}

SendInvitation.propTypes = {
  sendInvitations: PropTypes.array.isRequired,        // 发送的邀请
  onCancelInviteBtnClick: PropTypes.func.isRequired   // 点击取消时执行的回调函数
};
