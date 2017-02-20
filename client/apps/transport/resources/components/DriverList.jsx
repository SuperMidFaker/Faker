import React, { PropTypes } from 'react';
import { Breadcrumb, Menu, Layout, Table, Button } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { addUniqueKeys } from 'client/util/dataTransform';
import DriverModal from '../modals/driverModal';

const { Header, Content, Sider } = Layout;
const rowSelection = {
  onSelect() {},
};

function DriverList(props) {
  const { dataSource, onAddDriverBtnClicked, onStopDriverBtnClick, onResumeDriverBtnClick, handleEditDriverLogin, onEditDriver } = props;

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
      <Header className="top-bar">
        <Breadcrumb>
          <Breadcrumb.Item>
            资源设置
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            司机
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="top-bar-tools">
          <SearchBar placeholder="司机/手机" onInputSearch={props.onSearch}
            value={props.searchText} size="large"
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
            <Content style={{ padding: '0 24px', minHeight: 280 }}>
              <div className="toolbar">
                <PrivilegeCover module="transport" feature="resources" action="create">
                  <Button type="primary" size="large" onClick={onAddDriverBtnClicked} icon="plus-circle-o">新增司机</Button>
                </PrivilegeCover>
              </div>
              <div className="panel-body table-panel">
                <Table dataSource={addUniqueKeys(dataSource)} columns={columns} rowSelection={rowSelection} />
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
