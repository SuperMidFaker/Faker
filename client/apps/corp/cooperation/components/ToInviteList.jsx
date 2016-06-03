import React, { PropTypes } from 'react';
import { Table } from 'ant-ui';
import { partnerTypes, providerShorthandTypes } from '../util/dataMapping';

const rowSelection = {
  onChange() {}
};

export default function ToInviteList(props) {
  const { toInvites, onInviteBtnClick } = props;

  const columns = [
    {
      title: '合作伙伴',
      dataIndex: 'partner_name',
      key: 'partner_name'
    },
    {
      title: '代码',
      dataIndex: 'partner_code',
      key: 'partner_code'
    },
    {
      title: '关系类型',
      dataIndex: 'partnerships',
      key: 'partnerships',
      render(_, record) {
        const partnerships = record.partnerships;
        let content;
        if (partnerships.length === 1) {
          content = partnerTypes[partnerships[0]];
        } else {
          content = `${partnerships.map(ps => providerShorthandTypes[ps]).join('/')}提供商`;
        }
        return (
          <span>{content}</span>
        );
      }
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
        const partnerInfo = {
          partnerName: record.partner_name,
          partnerCode: record.partner_code,
          partnerTenantId: record.partner_tenant_id
        };
        return (
          <a onClick={() => onInviteBtnClick(partnerInfo)}>邀请加入</a>
        );
      }
    }
  ];
  return (
    <Table columns={columns} dataSource={toInvites} rowSelection={rowSelection}/>
  );
}

ToInviteList.propTypes = {
  toInvites: PropTypes.array.isRequired,        // 待邀请的列表数组
  onInviteBtnClick: PropTypes.func.isRequired,  // 邀请加入按钮点击时执行的回调函数
};
