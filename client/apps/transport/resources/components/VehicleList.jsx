import React, { PropTypes } from 'react';
import { Breadcrumb, Menu, Layout, Button, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { Link } from 'react-router';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { addUniqueKeys } from 'client/util/dataTransform';

const { Header, Content, Sider } = Layout;
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
          <Link to={`/transport/resources/vehicle/edit/${record.vehicle_id}`}>修改</Link>
          <span className="ant-divider" />
          <a onClick={() => onStopCarBtnClick(record.vehicle_id)} disabled={
            record.status === '在途中'
          }
          >
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
    <QueueAnim type={['bottom', 'up']}>
      <Header className="top-bar" key="header">
        <Breadcrumb>
          <Breadcrumb.Item>
            资源设置
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            车辆
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="top-bar-tools">
          <SearchBar placeholder="车牌号/司机" onInputSearch={props.onSearch}
            value={props.searchText} size="large"
          />
        </div>
      </Header>
      <Content className="main-content" key="main">
        <div className="page-body">
          <Layout style={{ padding: '16px 0', background: '#fff' }}>
            <Sider style={{ background: '#fff' }}>
              <Menu
                defaultSelectedKeys={['vehicle']}
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
                  <Button type="primary" size="large" onClick={onAddCarBtnClick} icon="plus-circle-o">新增车辆</Button>
                </PrivilegeCover>
              </div>
              <div className="panel-body table-panel">
                <Table columns={columns} dataSource={addUniqueKeys(dataSource)} rowSelection={rowSelection} />
              </div>
            </Content>
          </Layout>
        </div>
      </Content>
    </QueueAnim>
  );
}

VehicleList.propTypes = {
  dataSource: PropTypes.array,
  onAddCarBtnClick: PropTypes.func.isRequired,    // 点击新建车辆时触发的回调函数
  onStopCarBtnClick: PropTypes.func.isRequired,   // 停用按钮点击后执行的回调函数
  onResumeCarBtnClick: PropTypes.func.isRequired, // 启用按钮点击后执行的回调函数
  onSearch: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
};
