import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Menu, Layout, Button, Popconfirm } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/NavLink';
import SearchBar from 'client/components/SearchBar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { addUniqueKeys } from 'client/util/dataTransform';
import DriverModal from '../modals/driverModal';

const { Header, Content, Sider } = Layout;
const rowSelection = {
  onSelect() {},
};

function DriverList(props) {
  const { dataSource, onAddDriverBtnClicked, onStopDriverBtnClick, onResumeDriverBtnClick,
    handleEditDriverLogin, onEditDriver, onRemoveDriver } = props;

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
          <a onClick={() => onEditDriver(record.driver_id)}
            disabled={record.status === '不可用'}
          >
            修改
          </a>
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
          <span className="ant-divider" />
          <Popconfirm title="确定删除？" onConfirm={() => onRemoveDriver({ driverId: record.driver_id, driverLoginId: record.login_id })}>
            <a>删除</a>
          </Popconfirm>
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
      dataIndex: 'OPS_COL',
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
  const toolbarActions = (<span>
    <PrivilegeCover module="transport" feature="resources" action="create">
      <Button type="primary" onClick={onAddDriverBtnClicked} icon="plus-circle-o">新增司机</Button>
    </PrivilegeCover>
  </span>);
  return (
    <QueueAnim type={['bottom', 'up']}>
      <Header className="page-header">
        <Breadcrumb>
          <Breadcrumb.Item>
            资源设置
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            司机
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-header-tools">
          <SearchBar placeholder="司机/手机" onInputSearch={props.onSearch}
            value={props.searchText}
          />
        </div>
      </Header>
      <Content className="main-content" key="main">
        <div className="page-body">
          <Layout className="main-wrapper">
            <Sider className="nav-sider">
              <Menu
                defaultSelectedKeys={['driver']}
                mode="inline"
              >
                <Menu.Item key="carrier"><NavLink to="/transport/resources/carrier">承运商</NavLink></Menu.Item>
                <Menu.Item key="vehicle"><NavLink to="/transport/resources/vehicle">车辆</NavLink></Menu.Item>
                <Menu.Item key="driver"><NavLink to="/transport/resources/driver">司机</NavLink></Menu.Item>
                <Menu.Item key="location"><NavLink to="/transport/resources/node">收发货地</NavLink></Menu.Item>
              </Menu>
            </Sider>
            <Content className="nav-content">
              <div className="panel-body table-panel table-fixed-layout">
                <DataTable toolbarActions={toolbarActions} dataSource={addUniqueKeys(dataSource)} columns={columns} rowSelection={rowSelection} />
                <DriverModal />
              </div>
            </Content>
          </Layout>
        </div>
      </Content>
    </QueueAnim>
  );
}

DriverList.propTyps = {
  dataSource: PropTypes.array,
  onAddDriverBtnClicked: PropTypes.func.isRequired,   // 点击新建司机按钮后执行的回调函数
  onStopDriverBtnClick: PropTypes.func.isRequired,    // 点击停止车辆按钮的回调函数
  onResumeDriverBtnClick: PropTypes.func.isRequired,  // 点击启用车辆按钮的回调函数
  onSearch: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
};

export default DriverList;
