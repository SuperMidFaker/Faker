import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Table, Button, Layout, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import SearchBar from 'client/components/SearchBar';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BrokerModal from './modal/brokerModal';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { toggleBrokerModal, loadCmsBrokers, changeBrokerStatus, deleteBroker } from 'common/reducers/cmsBrokers';

const { Header, Content } = Layout;
const rowSelection = {
  onSelect() {},
};

function fetchData({ dispatch }) {
  return dispatch(loadCmsBrokers());
}

@connectFetch()(fetchData)
@connect(state => ({
  tenantId: state.account.tenantId,
  brokers: state.cmsBrokers.brokers,
}), { toggleBrokerModal, loadCmsBrokers, changeBrokerStatus, deleteBroker })
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class BrokerList extends Component {
  state = {
    searchText: '',
  }
  handleEditBtnClick = (broker) => {
    this.props.toggleBrokerModal(true, 'edit', broker);
  }
  handleAddBtnClick = () => {
    this.props.toggleBrokerModal(true, 'add');
  }
  handleStopBtnClick = (id, status) => {
    this.props.changeBrokerStatus(id, status).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleDeleteBtnClick = (id) => {
    this.props.deleteBroker(id).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleResumeBtnClick = (id, status) => {
    this.props.changeBrokerStatus(id, status).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleReload = () => {
    this.props.loadCmsBrokers();
  }
  handleSearch = (value) => {
    this.setState({ searchText: value });
  }
  renderEditAndStopOperations = itemInfo => (
    <PrivilegeCover module="corp" feature="partners" action="edit">
      <span>
        {itemInfo.editable === 1 && (
          <span>
            <a onClick={() => this.handleEditBtnClick(itemInfo)}>修改</a>
            <span className="ant-divider" />
          </span>)}
        <a onClick={() => this.handleStopBtnClick(itemInfo.id, false)}>停用</a>
      </span>
    </PrivilegeCover>
    )

  renderDeleteAndResumeOperations = (itemInfo) => {
    const { id } = itemInfo;
    return (
      <span>
        <PrivilegeCover module="corp" feature="partners" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDeleteBtnClick(id)}>
            <a>删除</a>
          </Popconfirm>
        </PrivilegeCover>
        <span className="ant-divider" />
        <PrivilegeCover module="corp" feature="partners" action="edit">
          <a onClick={() => this.handleResumeBtnClick(id, true)}>启用</a>
        </PrivilegeCover>
      </span>
    );
  }
  render() {
    const { brokers } = this.props;
    const data = brokers.filter((item) => {
      if (this.state.searchText) {
        const reg = new RegExp(this.state.searchText);
        return reg.test(item.name) || reg.test(item.customs_code) || reg.test(item.comp_code);
      } else {
        return true;
      }
    });
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'comp_name',
        key: 'name',
        width: 240,
      }, {
        title: '统一社会信用代码',
        dataIndex: 'comp_code',
        key: 'partner_unique_code',
        width: 200,
      }, {
        title: '海关编码',
        dataIndex: 'customs_code',
        key: 'customs_code',
        width: 200,
      }, {
        title: '检验检疫代码',
        dataIndex: 'ciq_code',
        key: 'ciq_code',
        width: 200,
      }, {
        title: '是否供应商',
        dataIndex: 'comp_partner_id',
        key: 'comp_partner_id',
        render(o) {
          if (o > 0) {
            return <span>是</span>;
          } else {
            return <span>否</span>;
          }
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
        dataIndex: 'creater_name',
        key: 'creater_name',
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
              <Button type="primary" onClick={this.handleAddBtnClick} icon="plus">新增</Button>
            </PrivilegeCover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder="名称/海关编码/统一社会信用代码" onInputSearch={this.handleSearch}
                value={this.state.searchText}
              />
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table dataSource={data} columns={columns} rowSelection={rowSelection} rowKey="id" />
            </div>
            <BrokerModal onOk={this.handleReload} />
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
