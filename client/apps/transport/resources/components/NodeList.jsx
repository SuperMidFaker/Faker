import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Menu, Button, Layout, Radio, Popconfirm } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import { Link } from 'react-router';
import NavLink from 'client/components/NavLink';
import SearchBar from 'client/components/SearchBar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { addUniqueKeys } from 'client/util/dataTransform';
import { nodeTypes } from '../utils/dataMapping';
import * as Location from 'client/util/location';
import NodeModal from '../modals/nodeModal';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Header, Content, Sider } = Layout;

const rowSelection = {
  onSelect() {

  },
};

export default function NodeList(props) {
  const { onDeleteBtnClick, dataSource, nodeType, onRadioButtonChange, onAddNoteBtnClick } = props;
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '别名',
      dataIndex: 'byname',
      key: 'byname',
    },
    {
      title: '外部代码',
      dataIndex: 'node_code',
      key: 'node_code',
    },
    {
      title: '关联方',
      dataIndex: 'ref_partner_name',
      key: 'ref_partner_name',
      filters: props.partners.map(item => ({ text: item.partner_code ? `${item.partner_code} | ${item.name}` : item.name, value: item.partner_id })),
      render: (col, row) => {
        if (row.ref_partner_id === -1) return '公用';
        return col;
      },
    },
    {
      title: '省/城市/县区',
      dataIndex: 'region',
      key: 'region',
      render: (col, row) => Location.renderLocation(row),
    },
    {
      title: '地址/坐标',
      dataIndex: 'addr',
      key: 'addr',
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: '联系电话',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: '联系邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '围栏及范围',
      dataIndex: 'geo_longitude',
      key: 'geo_longitude',
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
      render: (_, record) => (
        <span>
          <PrivilegeCover module="transport" feature="resources" action="edit">
            <Link to={`/transport/resources/node/edit/${record.node_id}`}>修改</Link>
          </PrivilegeCover>
          <span className="ant-divider" />
          <PrivilegeCover module="transport" feature="resources" action="delete">
            <Popconfirm title="确定要删除吗？" onConfirm={() => onDeleteBtnClick(record.node_id)}>
              <a>删除</a>
            </Popconfirm>
          </PrivilegeCover>
        </span>
        ),
    },
  ];
  const toolbarActions = (<span>
    <PrivilegeCover module="transport" feature="resources" action="create">
      <Button type="primary" size="large" onClick={onAddNoteBtnClick} icon="plus-circle-o">新增{nodeTypes[nodeType]}</Button>
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
            收发货地
          </Breadcrumb.Item>
        </Breadcrumb>
        <RadioGroup defaultValue={nodeType} onChange={e => onRadioButtonChange(e.target.value)} size="large">
          <RadioButton value={0}>发货地</RadioButton>
          <RadioButton value={1}>收货地</RadioButton>
          <RadioButton value={2}>中转地</RadioButton>
        </RadioGroup>
        <div className="page-header-tools">
          <SearchBar placeholder="名称/地址/联系人/电话/邮箱" onInputSearch={props.onSearch}
            value={props.searchText} size="large"
          />
        </div>
      </Header>
      <Content className="main-content" key="main">
        <div className="page-body">
          <Layout className="main-wrapper">
            <Sider className="nav-sider">
              <Menu
                defaultSelectedKeys={['location']}
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
                <DataTable toolbarActions={toolbarActions} rowSelection={rowSelection} columns={columns} dataSource={addUniqueKeys(dataSource)} onChange={props.handleTableChange} />
                <NodeModal />
              </div>
            </Content>
          </Layout>
        </div>
      </Content>
    </QueueAnim>
  );
}

NodeList.propsTypes = {
  dataSource: PropTypes.array.isRequired,
  nodeType: PropTypes.number.isRequired,          // 当前选中的node类型
  onDeleteBtnClick: PropTypes.func.isRequired,    // 删除按钮点击时触发的回调函数
  onRadioButtonChange: PropTypes.func.isRequired, // radio button改变时触发的回调函数
  onAddNoteBtnClick: PropTypes.func.isRequired,   // 新建按钮点击后执行的回调函数
  onSearch: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  partners: PropTypes.array.isRequired,
  handleTableChange: PropTypes.func.isRequired,
};
