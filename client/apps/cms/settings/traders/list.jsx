import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Table, Button, Layout, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BusinessUnitModal from './modal/traderModal';
import { I_E_TYPES } from 'common/constants';

const { Header, Content } = Layout;
const rowSelection = {
  onSelect() {},
};

export default class TraderList extends Component {
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
      render: (_, record) => (
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
        ),
    }];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              设置
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              进出口收发货人
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <PrivilegeCover module="clearance" feature="resources" action="create">
              <Button type="primary" size="large" onClick={() => onAddBtnClicked(type)} icon="plus">新增</Button>
            </PrivilegeCover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder="公司名称/社会信用代码" onInputSearch={this.handleSearch}
                value={searchText} size="large"
              />
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={data} columns={columns} rowSelection={rowSelection} rowKey="id" />
            </div>
            <BusinessUnitModal />
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
