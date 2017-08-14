import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Table, Button, Layout, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import SearchBar from 'client/components/SearchBar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BrokerModal from './modal/brokerModal';
import connectNav from 'client/common/decorators/connect-nav';
import { mapPartnerships } from './dataMapping';

const { Header, Content } = Layout;
const rowSelection = {
  onSelect() {},
};
@connectNav({
  depth: 2,
  muduleName: 'clearance',
})
export default class BrokerList extends Component {
  static propTyps = {
    dataSource: PropTypes.array,
    onAddBtnClicked: PropTypes.func.isRequired,
    onStopBtnClick: PropTypes.func.isRequired,
    onDeleteBtnClick: PropTypes.func.isRequired,
    onResumeBtnClick: PropTypes.func.isRequired,
    onEditBtnClick: PropTypes.func.isRequired,
  }
  state = {
    searchText: '',
  }
  handleSearch = (value) => {
    this.setState({ searchText: value });
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
    const data = dataSource.filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.name) || reg.test(item.customs_code) || reg.test(item.partner_unique_code);
      } else {
        return true;
      }
    });
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'name',
        key: 'name',
        width: 240,
      }, {
        title: '统一社会信用代码',
        dataIndex: 'partner_unique_code',
        key: 'partner_unique_code',
        width: 200,
      }, {
        title: '海关编码',
        dataIndex: 'customs_code',
        key: 'customs_code',
        width: 120,
      }, {
        title: '业务类型',
        dataIndex: 'business',
        key: 'business',
        render(o) {
          return (
            <span>{o ? mapPartnerships(o.split(',')) : ''}</span>
          );
        },
      }, {
        title: '创建日期',
        dataIndex: 'created_date',
        key: 'created_date',
        width: 140,
        render(o) {
          return moment(o).format('YYYY/MM/DD HH:mm');
        },
      }, {
        title: '创建人',
        dataIndex: 'created_by',
        key: 'created_by',
        width: 120,
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        width: 100,
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
              设置
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              报关报检代理
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <PrivilegeCover module="clearance" feature="resources" action="create">
              <Button type="primary" size="large" onClick={onAddBtnClicked} icon="plus">新增</Button>
            </PrivilegeCover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder="名称/海关编码/统一社会信用代码" onInputSearch={this.handleSearch}
                value={this.state.searchText} size="large"
              />
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table dataSource={data} columns={columns} rowSelection={rowSelection} rowKey="id" />
            </div>
            <BrokerModal />
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
