import React, { PropTypes } from 'react';
import { Table, Button } from 'ant-ui';
import { Link } from 'react-router';

const rowSelection = {
  onSelect() {
  }
};

function DriverList(props) {
  const { dataSource, onAddDriverBtnClicked, visible, onStopDriverBtnClick, onResumeDriverBtnClick } = props;

  function editAndStopDriverOperations(record) {
    return (
      <span>
        <Link to={`/transport/resources/edit_driver/${record.driver_id}`}>修改</Link>
        <span className="ant-divider"></span>
        <a onClick={ () => onStopDriverBtnClick(record.driver_id) }
           disabled={record.status === '不可用'}>
          停用
        </a>
      </span>
    );
  }

  function resumeDriverOperaions(record) {
    return (
      <span>
        <a
          onClick={ () => onResumeDriverBtnClick(record.driver_id)}>
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
      key: 'type'
    },
    {
      title: '指派车辆',
      dataIndex: 'plate_number',
      key: 'plate_number'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
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
      }
    }
  ];

  if (visible) {
    return (
      <div className="page-body">
        <div className="panel-body body-responsive" style={{padding: 20}}>
          <div style={{marginBottom: 16}}>
            <Button type="primary" size="large" onClick={onAddDriverBtnClicked}>新建司机</Button>
          </div>
          <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection}/>
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
}

DriverList.propTyps = {
  dataSource: PropTypes.array,
  onAddDriverBtnClicked: PropTypes.func.isRequired,   // 点击新建司机按钮后执行的回调函数
  visible: PropTypes.bool.isRequired,                 // 组件是否可见
  onStopDriverBtnClick: PropTypes.func.isRequired,    // 点击停止车辆按钮的回调函数
  onResumeDriverBtnClick: PropTypes.func.isRequired,  // 点击启用车辆按钮的回调函数
};

export default DriverList;
