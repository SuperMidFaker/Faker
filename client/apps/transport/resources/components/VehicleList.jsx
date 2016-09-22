import React, { PropTypes } from 'react';
import { Button, Table } from 'antd';
import { Link } from 'react-router';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { addUniqueKeys } from 'client/util/dataTransform';

const rowSelection = {
  onSelect() {
  },
};

export default function VehicleList(props) {
  const { onAddCarBtnClick, dataSource, onStopCarBtnClick, onResumeCarBtnClick } = props;

  function editAndStopCarOperations(record) {
    return (
      <PrivilegeCover module="transport" feature="resources" action="edit">
        <span>
          <Link to={`/transport/resources/edit_car/${record.vehicle_id}`}>修改</Link>
          <span className="ant-divider" />
          <a onClick={() => onStopCarBtnClick(record.vehicle_id)} disabled={
            record.status === '在途中'
          }>
            停用
          </a>
        </span>
      </PrivilegeCover>
    );
  }

  function resumeCarOperaions(record) {
    return (
      <PrivilegeCover module="transport" feature="resources" action="edit">
        <span>
          <a onClick={() => onResumeCarBtnClick(record.vehicle_id)}>
            启用
          </a>
        </span>
      </PrivilegeCover>
    );
  }

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'plate_number',
      key: 'plaste_number',
    },
    {
      title: '车型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '车长',
      dataIndex: 'length',
      key: 'length',
    },
    {
      title: '载重',
      dataIndex: 'load_weight',
      key: 'load_weight',
    },
    {
      title: '容积',
      dataIndex: 'load_volume',
      key: 'load_volume',
    },
    {
      title: '司机',
      dataIndex: 'driver_name',
      key: 'driver_name',
    },
    {
      title: '连接类型',
      dataIndex: 'connect_type',
      key: 'connect_type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      render: (_, record) => {
        if (record.status === '已停用') {
          return resumeCarOperaions(record);
        } else {
          return editAndStopCarOperations(record);
        }
      },
    },
  ];
  return (
    <div className="main-content">
      <div className="page-body">
        <div className="panel-header">
          <PrivilegeCover module="transport" feature="resources" action="create">
            <Button type="primary" onClick={onAddCarBtnClick} icon="plus-circle-o">新增车辆</Button>
          </PrivilegeCover>
        </div>
        <div className="panel-body table-panel">
          <Table columns={columns} dataSource={addUniqueKeys(dataSource)} rowSelection={rowSelection} />
        </div>
      </div>
    </div>
  );
}

VehicleList.propTypes = {
  dataSource: PropTypes.array,
  onAddCarBtnClick: PropTypes.func.isRequired,    // 点击新建车辆时触发的回调函数
  onStopCarBtnClick: PropTypes.func.isRequired,   // 停用按钮点击后执行的回调函数
  onResumeCarBtnClick: PropTypes.func.isRequired, // 启用按钮点击后执行的回调函数
};
