import React, { PropTypes } from 'react';
import { Table, Button } from 'antd';
import { Link } from 'react-router';
import { addUniqueKeys } from 'client/util/dataTransform';

const rowSelection = {
  onSelect() {
  },
};

function DriverList(props) {
  const { dataSource, onAddDriverBtnClicked, onStopDriverBtnClick, onResumeDriverBtnClick } = props;

  function editAndStopDriverOperations(record) {
    return (
      <span>
        <Link to={`/transport/resources/edit_driver/${record.driver_id}`}>修改</Link>
        <span className="ant-divider"></span>
        <a onClick={() => onStopDriverBtnClick(record.driver_id)}
          disabled={record.status === '不可用'}
        >
          停用
        </a>
      </span>
    );
  }

  function resumeDriverOperaions(record) {
    return (
      <span>
        <a
          onClick={() => onResumeDriverBtnClick(record.driver_id)}
        >
          启用
        </a>
      </span>
    );
  }

  const columns = [
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      key: 'type',
    },
    {
      title: '指派车辆',
      dataIndex: 'plate_number',
      key: 'plate_number',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      render: (_, record) => {
        if (record.status === '不可用') {
          return resumeDriverOperaions(record);
        } else {
          return editAndStopDriverOperations(record);
        }
      },
    },
  ];
  return (
    <div className="main-content">
      <div className="page-header">
        <div className="tools">
          <Button size="large" type="primary" onClick={onAddDriverBtnClicked} icon="plus-circle-o">新增司机</Button>
        </div>
      </div>
      <div className="page-body">
        <div className="panel-body">
          <Table dataSource={addUniqueKeys(dataSource)} columns={columns} rowSelection={rowSelection} />
        </div>
      </div>
    </div>
  );
}

DriverList.propTyps = {
  dataSource: PropTypes.array,
  onAddDriverBtnClicked: PropTypes.func.isRequired,   // 点击新建司机按钮后执行的回调函数
  onStopDriverBtnClick: PropTypes.func.isRequired,    // 点击停止车辆按钮的回调函数
  onResumeDriverBtnClick: PropTypes.func.isRequired,  // 点击启用车辆按钮的回调函数
};

export default DriverList;
