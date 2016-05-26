import React, { Component } from 'react';
import { Table, Icon, Button } from 'ant-ui';

const partnerTypes = {
  CUS: '客户',
  SUP: '供应商',
  TRS: '运输提供商',
  WHS: '仓储提供商',
  CCB: '报关提供商',
  FWD: '货代提供商'
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

function onAddBtnClick(config) {
  console.log('Base add btn');
}

function renderOperations(itemInfo) {
  console.log('Base render operations');
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
    dataIndex: 'partner_code',
    key: 'partner_code'
  },
  {
    title: '是否平台租户',
    dataIndex: 'tenant_type',
    key: 'tenant_type'
  },
  {
    title: '业务量',
    dataIndex: 'bussiness_volume',
    key: 'bussiness_volume'
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
        console.log(partnerlist);
        const dataSource = partnerlist/*.filter(partner => partner.type === type)*/;
        return (
          <div className="main-content">
            <div className="page-body">
              <div className="panel-header">
                <Button type="primary" onClick={onAddBtnClick}><Icon type="plus-circle-o"/>新增{partnerTypeName}</Button>
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
