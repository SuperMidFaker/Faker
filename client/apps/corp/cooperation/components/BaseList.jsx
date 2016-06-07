import React, { Component } from 'react';
import { Table, Icon, Button, message } from 'ant-ui';
import { partnerTypes, tenantTypes } from '../util/dataMapping';
import partnerModal from './partnerModal';

const rowSelection = {
  onChange() {}
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
      key: 'name'
    },
    {
      title: '客户代码',
      dataIndex: 'partnerCode',
      key: 'partnerCode'
    },
    {
      title: '是否平台租户',
      dataIndex: 'tenantType',
      key: 'tenantType',
      render: (_, record) => {
        if (record.tenantType === 'TENANT_OFFLINE') {
          return (
            <a>邀请加入</a>
          );
        } else {
          return (
            <span>{tenantTypes[record.tenantType]}</span>
          );
        }
      }
    },
    {
      title: '业务量',
      dataIndex: 'volume',
      key: 'volume'
    },
    {
      title: '营收',
      dataIndex: 'revenue',
      key: 'revenue'
    },
    {
      title: '成本',
      dataIndex: 'cost',
      key: 'cost'
    },
    {
      title: '创建日期',
      dataIndex: 'created_date',
      key: 'created_date'
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
      }
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
    return partnerlist.filter(partner => partner.types.some(pType => pType.code === type));
  }
  handleAddBtnClick = () => {
    const { tenantId } = this.props;
    let partnerships = this.partnerships;
    partnerships = Array.isArray(partnerships) ? partnerships : [partnerships];
    partnerModal({
      onOk: (partnerInfo) => {
        this.props.addPartner({tenantId, partnerInfo, partnerships});
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
    const { key, name, partnerCode } = itemInfo;
    return (
      <span>
        <a onClick={() => this.handleEditBtnClick(key, name, partnerCode)}>修改</a>
        <span className="ant-divider"></span>
        <a onClick={() => this.handleStopBtnClick(key)}>停用</a>
      </span>
    );
  }
  renderDeleteAndResumeOperations(itemInfo) {
    const {key} = itemInfo;
    return (
      <span>
        <a onClick={() => this.handleDeleteBtnClick(key)}>删除</a>
        <span className="ant-divider"></span>
        <a onClick={() => this.handleResumeBtnClick(key)}>启用</a>
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
          {header}
        </div>
        <div className="page-body">
          <div className="panel-header">
            <Button type="primary" onClick={this.handleAddBtnClick}><Icon type="plus-circle-o"/>新增{partnerTypeName}</Button>
          </div>
          <div className="panel-body padding">
            <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection}/>
          </div>
        </div>
      </div>
    );
  }
}
