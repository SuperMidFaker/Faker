import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Menu, Layout, Button, Popconfirm } from 'antd';
import Table from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import NavLink from 'client/components/NavLink';
import SearchBar from 'client/components/SearchBar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import CarrierModal from '../modals/carrierModal';

const { Header, Content, Sider } = Layout;
const rowSelection = {
  onSelect() {},
};

export default class DriverList extends Component {
  static propTyps = {
    dataSource: PropTypes.array,
    onAddBtnClicked: PropTypes.func.isRequired,
    onStopBtnClick: PropTypes.func.isRequired,
    onDeleteBtnClick: PropTypes.func.isRequired,
    onResumeBtnClick: PropTypes.func.isRequired,
    onEditBtnClick: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    searchText: PropTypes.string.isRequired,
  }

  renderEditAndStopOperations = itemInfo => (
    <PrivilegeCover module="corp" feature="partners" action="edit">
      <span>
        <a onClick={() => this.props.onEditBtnClick(itemInfo)}>修改</a>
        <span className="ant-divider" />
        <a onClick={() => this.props.onStopBtnClick(itemInfo.id)}>停用</a>
      </span>
    </PrivilegeCover>
    )

  renderDeleteAndResumeOperations = (itemInfo) => {
    const { id } = itemInfo;
    return (
      <span>
        <PrivilegeCover module="corp" feature="partners" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.onDeleteBtnClick(id)}>
            <a>删除</a>
          </Popconfirm>
        </PrivilegeCover>
        <span className="ant-divider" />
        <PrivilegeCover module="corp" feature="partners" action="edit">
          <a onClick={() => this.props.onResumeBtnClick(id)}>启用</a>
        </PrivilegeCover>
      </span>
    );
  }
  render() {
    const { dataSource, onAddBtnClicked } = this.props;

    const columns = [
      {
        title: '承运商名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '承运商代码',
        dataIndex: 'partner_code',
        key: 'partner_code',
      }, {
        title: '统一社会信用代码',
        dataIndex: 'partner_unique_code',
        key: 'partner_unique_code',
      }, {
        title: '创建日期',
        dataIndex: 'created_date',
        key: 'created_date',
        render(o) {
          return moment(o).format('YYYY/MM/DD HH:mm');
        },
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        render: (_, record, index) => {
          if (record.status === 1) {
            return this.renderEditAndStopOperations(record, index);
          } else {
            return this.renderDeleteAndResumeOperations(record);
          }
        },
      },
    ];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              资源设置
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              承运商
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <SearchBar placeholder="承运商/承运商代码/统一社会信用代码" onInputSearch={this.props.onSearch}
              value={this.props.searchText} size="large"
            />
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu
                  defaultSelectedKeys={['carrier']}
                  mode="inline"
                >
                  <Menu.Item key="carrier"><NavLink to="/transport/resources/carrier">承运商</NavLink></Menu.Item>
                  <Menu.Item key="vehicle"><NavLink to="/transport/resources/vehicle">车辆</NavLink></Menu.Item>
                  <Menu.Item key="driver"><NavLink to="/transport/resources/driver">司机</NavLink></Menu.Item>
                  <Menu.Item key="location"><NavLink to="/transport/resources/node">收发货地</NavLink></Menu.Item>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <div className="toolbar">
                  <PrivilegeCover module="transport" feature="resources" action="create">
                    <Button type="primary" size="large" onClick={onAddBtnClicked} icon="plus-circle-o">新增承运商</Button>
                  </PrivilegeCover>
                </div>
                <div className="panel-body table-panel table-fixed-layout">
                  <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} />
                </div>
              </Content>
            </Layout>
            <CarrierModal />
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
