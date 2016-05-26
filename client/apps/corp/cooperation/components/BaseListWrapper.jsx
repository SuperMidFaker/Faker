import React, { Component } from 'react';
import { Table, Icon, Button } from 'ant-ui';
// import PartnerModal from 'client/components/partner-setup-modal';
import PartnerModal from './PartnerModal';

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

function handleEditBtnClick(itemId) {
  console.log('Base edit btn');
}

function handleStopBtnClick(itemId) {
  console.log('Base stopo btn');
}

function handleResumeBtnClick(itemId) {
  console.log('Base resume btn');
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

let rowSelection = {
  onChange() {}
};

let columns = [
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
        return <a>邀请加入</a>
      } else {
        return <span>{tenantTypes[record.tenantType]}</span>
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

export default function BaseListWrapper(config) {
  return (WrappedComponent) => {
    return class BaseList extends Component {
      onAddBtnClick = () => {
        // this.props.showPartnerModal();
        PartnerModal({
          partnerlist: [{name: 'zank'}, {name: 'ywwhack'}],
          onOk(value) {
            console.log(value);
          }
        });
        console.log('Base props add btn');
      }
      render() {
        const { type } = config;
        const partnerTypeName = partnerTypes[type];
        // columns configuration
        if (config.columns) {
          columns = config.columns;
        }
        if (config.updatedColumns) {
          for (let column of config.updatedColumns) {
            columns[column.col] = column.content;
          }
        }
        if (config.insertColumn) {
          const insertIndex = config.insertColumn.col;
          columns = [...columns.slice(0, insertIndex), config.insertColumn.content, ...columns.slice(insertIndex + 1)];
        }
        columns[0].title = columns[1].title = `${partnerTypeName}名称`;
        // end columns configuration
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
  }
}
