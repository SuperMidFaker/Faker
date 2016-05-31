import React, { Component } from 'react';
import { Table, Icon, Button, message } from 'ant-ui';
import { partnerTypes, tenantTypes } from '../util/dataMapping';
import partnerModal from './partnerModal';

function handleEditBtnClick() {
}

function handleStopBtnClick() {
}

function renderOperations(itemInfo) {
  const {itemId} = itemInfo;
  return (
    <span>
      <a onClick={() => handleEditBtnClick(itemId)}>修改</a>
      <span className="ant-divider"></span>
      <a onClick={() => handleStopBtnClick(itemId)}>停用</a>
    </span>
  );
}

const rowSelection = {
  onChange() {}
};

const defaultColumns = [
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
    dataIndex: 'create_date',
    key: 'create_date'
  },
  {
    title: '操作',
    dataIndex: 'operaions',
    key: 'operations',
    render: (_, record) => {
      return renderOperations(record);
    }
  },
];

/**
 * 协作网络List列表的基类
 */
export default class BaseList extends Component {
  constructor() {
    super();
    this.type = 'CUS';
    this.partnerships = ['CUS'];
  }
  onAddBtnClick() {
    const { tenantId } = this.props;
    let partnerships = this.partnerships;
    partnerships = Array.isArray(partnerships) ? partnerships : [partnerships];
    partnerModal({
      onOk: (partnerInfo) => {
        this.props.addPartner({tenantId, partnerInfo, partnerships});
        message.success('合作伙伴已添加');
      }
    });
  }
  setHeader() { // 子类通过这个方法来设置头部UI,默认不显示头部UI
    return (
      <div></div>
    );
  }
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
  render() {
    const { type } = this;
    const partnerTypeName = partnerTypes[type];
    const columns = this.updateColumns(defaultColumns);
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
            <Button type="primary" onClick={this.onAddBtnClick.bind(this)}><Icon type="plus-circle-o"/>新增{partnerTypeName}</Button>
          </div>
          <div className="panel-body padding">
            <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection}/>
          </div>
        </div>
      </div>
    );
  }
}
