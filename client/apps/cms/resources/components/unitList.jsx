import React, { Component, PropTypes } from 'react';
import { Breadcrumb, Table, Button, Layout, Menu, Popconfirm, Radio } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BusinessUnitModal from '../modals/businessUnitModal';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Header, Content, Sider } = Layout;
const rowSelection = {
  onSelect() {},
};

export default class UnitList extends Component {
  static propTyps = {
    dataSource: PropTypes.array,
    onAddBtnClicked: PropTypes.func.isRequired,
    onDeleteBtnClick: PropTypes.func.isRequired,
    onEditBtnClick: PropTypes.func.isRequired,
  }
  state = {
    type: 1,
    searchText: '',
  }
  handleSearch = (value) => {
    this.setState({ searchText: value });
  }
  render() {
    const { dataSource, onAddBtnClicked } = this.props;
    const { type, searchText } = this.state;
    const data = dataSource.filter(item => item.type === type).filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.name) || reg.test(item.code) || reg.test(item.receive_code);
      } else {
        return true;
      }
    });
    const columns = [{
      title: '公司名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '社会信用代码',
      dataIndex: 'code',
      key: 'code',
    }];
    if (type === 3) {
      columns.push({
        title: '接收代码',
        dataIndex: 'receive_code',
        key: 'receive_code',
      });
    }
    columns.push({
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      render: (_, record) => {
        const { id } = record;
        return (
          <span>
            <PrivilegeCover module="corp" feature="partners" action="edit">
              <a onClick={() => this.props.onEditBtnClick(record)}>修改</a>
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="corp" feature="partners" action="delete">
              <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.onDeleteBtnClick(id)}>
                <a>删除</a>
              </Popconfirm>
            </PrivilegeCover>
          </span>
        );
      },
    });
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              资源设置
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              经营单位
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={type} onChange={e => this.setState({ type: e.target.value })} size="large">
            <RadioButton value={1}>收发货人</RadioButton>
            <RadioButton value={2}>消费使用单位</RadioButton>
            <RadioButton value={3}>生产销售单位</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <SearchBar placeholder="公司名称/社会信用代码/接收代码" onInputSearch={this.handleSearch}
              value={searchText} size="large"
            />
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu
                  defaultSelectedKeys={['unit']}
                  mode="inline"
                >
                  <Menu.Item key="broker"><NavLink to="/clearance/resources/broker">报关行</NavLink></Menu.Item>
                  <Menu.Item key="unit"><NavLink to="/clearance/resources/unit">经营单位</NavLink></Menu.Item>
                </Menu>
              </Sider>
              <Content style={{ padding: '0 24px', minHeight: 280 }}>
                <div className="toolbar">
                  <PrivilegeCover module="clearance" feature="resources" action="create">
                    <Button type="primary" size="large" onClick={() => onAddBtnClicked(type)} icon="plus-circle-o">新增</Button>
                  </PrivilegeCover>
                </div>
                <div className="panel-body table-panel">
                  <Table dataSource={data} columns={columns} rowSelection={rowSelection} />
                </div>
              </Content>
            </Layout>
            <BusinessUnitModal />
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
