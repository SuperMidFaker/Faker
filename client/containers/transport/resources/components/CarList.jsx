import React, { PropTypes } from 'react';
import { Button, Table, Spin } from 'ant-ui';
import { Link } from 'react-router';

const rowSelection = {
  onSelect() {
  }
};

export default function CarList(props) {
  const { onAddCarBtnClick, dataSource, visible, loading, onStopCarBtnClick, onResumeCarBtnClick } = props;

  function editAndStopCarOperations(record) {
    return (
      <span>
        <Link to={`/transport/resources/edit_car/${record.vehicle_id}`}>修改</Link>
        <span className="ant-divider"></span>
        <a onClick={ () => onStopCarBtnClick(record.vehicle_id) }
                disabled={record.status === '在途中'}>
          停用
        </a>
      </span>
    );
  }

  function resumeCarOperaions(record) {
    return (
      <span>
        <a
           onClick={ () => onResumeCarBtnClick(record.vehicle_id)}>
          启用
        </a>
      </span>
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
      key: 'type'
    },
    {
      title: '车长',
      dataIndex: 'length',
      key: 'length'
    },
    {
      title: '载重',
      dataIndex: 'load_weight',
      key: 'load_weight'
    },
    {
      title: '容积',
      dataIndex: 'load_volume',
      key: 'load_volume'
    },
    {
      title: '司机',
      dataIndex: 'driver_name',
      key: 'driver_name'
    },
    {
      title: '连接类型',
      dataIndex: 'connect_type',
      key: 'connect_type'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
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
      }
    }
  ];

  if (visible) {
    return (
      <Spin spinning={loading}>
        <div style={{marginBottom: 16}}>
          <Button type="primary" size="large" onClick={onAddCarBtnClick}>新建车辆</Button>
        </div>
        <Table columns={columns} dataSource={dataSource} rowSelection={rowSelection} />
      </Spin>
    );
  } else {
    return <div></div>;
  }
}

CarList.propTypes = {
  dataSource: PropTypes.array,
  onAddCarBtnClick: PropTypes.func.isRequired,  // 点击新建车辆时触发的回调函数
  visible: PropTypes.bool.isRequired,             // 组件是否可见
  loading: PropTypes.bool.isRequired,             // 组件是否在加载
  onStopCarBtnClick: PropTypes.func.isRequired,   // 停用按钮点击后执行的回调函数
  onResumeCarBtnClick: PropTypes.func.isRequired, // 启用按钮点击后执行的回调函数
};
