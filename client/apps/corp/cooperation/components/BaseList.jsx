import React, { Component } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import moment from 'moment';
import { partnerTypes, tenantTypes } from '../util/dataMapping';
import partnerModal from './partnerModal';
import inviteModal from './inviteModal';

const rowSelection = {
  onChange() {},
};

/**
 * 协作网络List列表的基类
 */
export default class BaseList extends Component {
  constructor() {
    super();
    this.type = 'CUS';
    this.partnerships = ['CUS'];
  }
  setHeader() { // 子类通过这个方法来设置头部UI,默认不显示头部UI
    return (
      <div />
    );
  }
  defaultColumns = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '客户代码',
      dataIndex: 'partnerCode',
      key: 'partnerCode',
    },
    {
      title: '是否平台租户',
      dataIndex: 'tenantType',
      key: 'tenantType',
      render: (_, record) => {
        if (record.tenantType === 'TENANT_OFFLINE') {
          if (record.invited === 1) {
            return (
              <span>已邀请</span>
            );
          } else {
            const inviteeInfo = {
              name: record.name,
              code: record.partnerCode,
              tenantId: record.tenantId,
              partnerId: record.id,
            };
            return (
              <a onClick={() => this.handleInviteBtnClick(inviteeInfo)}>邀请加入</a>
            );
          }
        } else {
          return (
            <span>{tenantTypes[record.tenantType]}</span>
          );
        }
      },
    },
    {
      title: '业务量',
      dataIndex: 'volume',
      key: 'volume',
    },
    {
      title: '营收',
      dataIndex: 'revenue',
      key: 'revenue',
    },
    {
      title: '成本',
      dataIndex: 'cost',
      key: 'cost',
    },
    {
      title: '创建日期',
      dataIndex: 'created_date',
      key: 'created_date',
      render(_, record) {
        return (
          <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'operaions',
      key: 'operations',
      render: (_, record, index) => {
        if (record.status === 1) {
          return this.renderEditAndStopOperations(record, index);
        } else {
          return this.renderDeleteAndResumeOperations(record);
        }
      },
    },
  ]
  updateColumns(columns) { // 子类重载这个方法来自定义新的columns结构
    const { type } = this;
    const retColumns = [...columns];
    const partnerTypeName = partnerTypes[type];
    retColumns[0].title = `${partnerTypeName}名称`;
    retColumns[1].title = `${partnerTypeName}代码`;
    return retColumns;
  }
  dataSourceFromPartnerlist(partnerlist) {  // 子类重载这个方法来展示数据
    const { type } = this;
    return partnerlist.filter(partner => partner.partnerships.some(ps => ps === type));
  }
  handleAddBtnClick() {
    const { tenantId } = this.props;
    let partnerships = this.partnerships;
    partnerships = Array.isArray(partnerships) ? partnerships : [partnerships];
    partnerModal({
      onOk: (partnerInfo) => {
        this.props.addPartner({ tenantId, partnerInfo, partnerships });
        message.success('合作伙伴已添加');
      },
    });
  }
  handleEditBtnClick(key, name, code) {
    partnerModal({
      onOk: (ename, ecode) => {
        this.props.editPartner(key, ename, ecode).then(
          result => {
            if (result.error) {
              message.error(result.error.message);
            }
          });
      },
      editInfo: {
        name,
        code,
      },
    });
  }
  handleInviteBtnClick(inviteeInfo) {
    const { tenantId } = this.props;
    inviteModal({
      onOk: (contactInfo) => {
        this.props.inviteOfflinePartner({ tenantId, contactInfo, inviteeInfo });
        this.props.invitePartner(inviteeInfo.partnerId);
      },
    });
  }
  handleStopBtnClick(id) {
    this.props.changePartnerStatus(id, 0);
  }
  handleDeleteBtnClick(id) {
    this.props.deletePartner(id);
  }
  handleResumeBtnClick(id) {
    this.props.changePartnerStatus(id, 1);
  }
  renderEditAndStopOperations(itemInfo) {
    const { id, name, partnerCode } = itemInfo;
    return (
      <span>
        <a onClick={() => this.handleEditBtnClick(id, name, partnerCode)}>修改</a>
        <span className="ant-divider"></span>
        <a onClick={() => this.handleStopBtnClick(id)}>停用</a>
      </span>
    );
  }
  renderDeleteAndResumeOperations(itemInfo) {
    const { id } = itemInfo;
    return (
      <span>
        <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDeleteBtnClick(id)}>
          <a>删除</a>
        </Popconfirm>
        <span className="ant-divider"></span>
        <a onClick={() => this.handleResumeBtnClick(id)}>启用</a>
      </span>
    );
  }
  render() {
    const { type } = this;
    const partnerTypeName = partnerTypes[type];
    const columns = this.updateColumns(this.defaultColumns);
    const { partnerlist = [] } = this.props;
    const dataSource = this.dataSourceFromPartnerlist(partnerlist);
    const header = this.setHeader();
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <Button type="primary" size="large" onClick={() => this.handleAddBtnClick()} icon="plus-circle-o">新增{partnerTypeName}</Button>
          </div>
          {header}
        </div>
        <div className="page-body">
          <div className="panel-body">
            <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} />
          </div>
        </div>
      </div>
    );
  }
}
