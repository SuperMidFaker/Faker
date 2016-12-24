import React, { PropTypes } from 'react';
import { Table, Button } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { Link } from 'react-router';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { addUniqueKeys } from 'client/util/dataTransform';

const rowSelection = {
  onSelect() {},
};

function DriverList(props) {
  const { dataSource, onAddDriverBtnClicked, onStopDriverBtnClick, onResumeDriverBtnClick, handleEditDriverLogin } = props;

  function phoneLogin(record) {
    if (record.login_disabled === 1 || record.login_disabled === null) {
      return (
        <span>
          <span className="ant-divider" />
          <a onClick={() => handleEditDriverLogin({ driverId: record.driver_id, driverInfo: { login_id: record.login_id, login_disabled: record.login_disabled, phone: record.phone } })}>
            开启手机登录
          </a>
        </span>
      );
    } else {
      return (
        <span>
          <span className="ant-divider" />
          <a onClick={() => handleEditDriverLogin({ driverId: record.driver_id, driverInfo: { login_id: record.login_id, login_disabled: record.login_disabled, phone: record.phone } })}>
            关闭手机登录
          </a>
        </span>
      );
    }
  }

  function editAndStopDriverOperations(record) {
    return (
      <PrivilegeCover module="transport" feature="resources" action="edit">
        <span>
          <Link to={`/transport/resources/driver/edit/${record.driver_id}`}>修改</Link>
          <span className="ant-divider" />
          <a onClick={() => onStopDriverBtnClick(record.driver_id)}
            disabled={record.status === '不可用'}
          >
            停用
          </a>
          {phoneLogin(record)}
        </span>
      </PrivilegeCover>
    );
  }

  function resumeDriverOperaions(record) {
    return (
      <PrivilegeCover module="transport" feature="resources" action="edit">
        <span>
          <a onClick={() => onResumeDriverBtnClick(record.driver_id)}>
            启用
          </a>
        </span>
      </PrivilegeCover>
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
    <QueueAnim type={['bottom', 'up']}>
      <header className="top-bar" key="header">
        <span>司机管理</span>
      </header>
      <div className="main-content" key="main">
        <div className="page-body">
          <div className="toolbar">
            <PrivilegeCover module="transport" feature="resources" action="create">
              <Button type="primary" onClick={onAddDriverBtnClicked} icon="plus-circle-o">新增司机</Button>
            </PrivilegeCover>
          </div>
          <div className="panel-body table-panel">
            <Table dataSource={addUniqueKeys(dataSource)} columns={columns} rowSelection={rowSelection} />
          </div>
        </div>
      </div>
    </QueueAnim>
  );
}

DriverList.propTyps = {
  dataSource: PropTypes.array,
  onAddDriverBtnClicked: PropTypes.func.isRequired,   // 点击新建司机按钮后执行的回调函数
  onStopDriverBtnClick: PropTypes.func.isRequired,    // 点击停止车辆按钮的回调函数
  onResumeDriverBtnClick: PropTypes.func.isRequired,  // 点击启用车辆按钮的回调函数
};

export default DriverList;
