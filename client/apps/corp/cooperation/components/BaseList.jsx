import React, { Component } from 'react';
import { Table, Icon, Button } from 'ant-ui';
import partnerModal from './PartnerModal';

const partnerTypes = {
  CUS: '客户',
  SUP: '供应商',
  TRS: '运输提供商',
  WHS: '仓储提供商',
  CCB: '报关提供商',
  FWD: '货代提供商'
};

const tenantTypes = {
  TENANT_ENTERPRISE: '企业租户',
  TENANT_BRANCH: '企业子租户',
  TENANT_EXT: '扩展租户',
  TENANT_OFFLINE: '非平台租户'
};

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
  onAddBtnClick = () => {
    const { partnerTenants, tenantId } = this.props;
    let partnerships = this.partnerships;
    partnerships = Array.isArray(partnerships) ? partnerships : [partnerships];
    partnerModal({
      partnerTenants,
      onOk: (partnerTenant) => {
        this.props.inviteOnlPartner(tenantId, partnerTenant.id, partnerTenant.code, partnerships);
      }
    });
  }
  updateColumns(columns) { // 子类重载这个方法来自定义新的columns结构
    return columns;
  }
  render() {
    const { type } = this;
    const partnerTypeName = partnerTypes[type];
    const columns = this.updateColumns(defaultColumns);
    columns[0].title = `${partnerTypeName}名称`;
    columns[1].title = `${partnerTypeName}代码`;
    const { partnerlist = [] } = this.props;
    const dataSource = partnerlist.filter(partner => partner.types.some(pType => pType.code === type));
    return (
      <div className="main-content">
        <div className="page-body">
          <div className="panel-header">
            <Button type="primary" onClick={this.onAddBtnClick}><Icon type="plus-circle-o"/>新增{partnerTypeName}</Button>
          </div>
          <div className="panel-body padding">
            <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection}/>
          </div>
        </div>
      </div>
    );
  }
}
