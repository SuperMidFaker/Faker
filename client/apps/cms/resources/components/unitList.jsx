import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Table, Button, Layout, Menu, Popconfirm, Radio } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BusinessUnitModal from '../modals/businessUnitModal';
import { I_E_TYPES } from 'common/constants';

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
    type: 'trade',
    searchText: '',
  }
  handleSearch = (value) => {
    this.setState({ searchText: value });
  }
  render() {
    const { dataSource, onAddBtnClicked } = this.props;
    const { type, searchText } = this.state;
    const data = dataSource.filter(item => item.relation_type === type).filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.comp_name) || reg.test(item.comp_code) || reg.test(item.receive_code);
      } else {
        return true;
      }
    });
    const columns = [{
      title: '公司名称',
      dataIndex: 'comp_name',
      key: 'comp_name',
      width: 240,
    }, {
      title: '统一社会信用代码',
      dataIndex: 'comp_code',
      key: 'comp_code',
      width: 200,
    }, {
      title: '海关编码',
      dataIndex: 'customs_code',
      key: 'customs_code',
      width: 120,
    }, {
      title: '进出口类型',
      dataIndex: 'i_e_type',
      key: 'i_e_type',
      width: 100,
      render: (col) => {
        const ieType = I_E_TYPES.find(item => item.key === col);
        if (ieType) return ieType.value;
        else return '';
      },
    }, {
      title: '操作',
      dataIndex: 'id',
      width: 100,
      key: 'id',
      render: (_, record) => {
        if (record.comp_partner_id === null) {
          return (
            <span>
              <PrivilegeCover module="corp" feature="partners" action="edit">
                <a onClick={() => this.props.onEditBtnClick(record)}>修改</a>
              </PrivilegeCover>
              <span className="ant-divider" />
              <PrivilegeCover module="corp" feature="partners" action="delete">
                <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.onDeleteBtnClick(record.id)}>
                  <a>删除</a>
                </Popconfirm>
              </PrivilegeCover>
            </span>
          );
        } else {
          return '';
        }
      },
    }];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              资源设置
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              经营单位代码
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={type} onChange={e => this.setState({ type: e.target.value })} size="large">
            <RadioButton value="trade">收发货人</RadioButton>
            <RadioButton value="agent">申报单位</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <PrivilegeCover module="clearance" feature="resources" action="create">
              <Button type="primary" size="large" onClick={() => onAddBtnClicked(type)} icon="plus">新增</Button>
            </PrivilegeCover>
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
                  <Menu.Item key="broker"><NavLink to="/clearance/resources/broker">清关服务商</NavLink></Menu.Item>
                  <Menu.Item key="unit"><NavLink to="/clearance/resources/unit">经营单位代码</NavLink></Menu.Item>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <div className="toolbar">
                  <SearchBar placeholder="公司名称/社会信用代码" onInputSearch={this.handleSearch}
                    value={searchText} size="large"
                  />
                </div>
                <div className="panel-body table-panel">
                  <Table dataSource={data} columns={columns} rowSelection={rowSelection} rowKey="id" />
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
