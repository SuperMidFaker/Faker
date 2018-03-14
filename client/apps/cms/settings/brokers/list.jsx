import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Popconfirm, Tag } from 'antd';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { toggleBrokerModal, loadCmsBrokers, changeBrokerStatus, deleteBroker } from 'common/reducers/cmsBrokers';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import SettingMenu from '../menu';
import BrokerModal from './modal/brokerModal';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;


function fetchData({ dispatch }) {
  return dispatch(loadCmsBrokers());
}

@connectFetch()(fetchData)
@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  brokers: state.cmsBrokers.brokers,
}), {
  toggleBrokerModal, loadCmsBrokers, changeBrokerStatus, deleteBroker,
})
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class BrokerList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    searchText: '',
  }
  msg = formatMsg(this.props.intl)
  handleEditBtnClick = (broker) => {
    this.props.toggleBrokerModal(true, 'edit', broker);
  }
  handleAddBtnClick = () => {
    this.props.toggleBrokerModal(true, 'add');
  }
  handleStopBtnClick = (row) => {
    this.props.changeBrokerStatus(row.id, false).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleDeleteBtnClick = (row) => {
    this.props.deleteBroker(row.id).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleResumeBtnClick = (row) => {
    this.props.changeBrokerStatus(row.id, true).then((result) => {
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
          <Popconfirm title="确定删除？" onConfirm={() => this.handleDeleteBtnClick(id)}>
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
      }
      return true;
    });
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'comp_name',
        key: 'name',
        width: 300,
      }, {
        title: '统一社会信用代码',
        dataIndex: 'comp_code',
        key: 'partner_unique_code',
        width: 200,
      }, {
        title: '海关编码',
        dataIndex: 'customs_code',
        key: 'customs_code',
        width: 150,
      }, {
        title: '检验检疫代码',
        dataIndex: 'ciq_code',
        key: 'ciq_code',
        width: 150,
      }, {
        title: '是否服务商',
        dataIndex: 'comp_partner_id',
        key: 'comp_partner_id',
        render(o) {
          if (o > 0) {
            return <span>是</span>;
          }
          return <span>否</span>;
        },
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: o => (o === 1 ? <Tag color="green">已启用</Tag> : <Tag>已停用</Tag>),
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
        key: 'OP_COL',
        width: 160,
        fixed: 'right',
        render: (_, record) => (<span>
          <RowAction onClick={this.handleEditBtnClick} icon="edit" label={this.msg('modify')} row={record} />
          {record.status === 1 ? <RowAction onClick={this.handleStopBtnClick} icon="pause-circle" tooltip={this.msg('stop')} row={record} /> :
          <RowAction onClick={this.handleResumeBtnClick} icon="play-circle" tooltip={this.msg('resume')} row={record} />
          }
          <RowAction confirm="确定要删除？" onConfirm={this.handleDeleteBtnClick} icon="delete" tooltip={this.msg('delete')} row={record} />
        </span>
        ),
      },
    ];
    const toolbarActions = (<SearchBox
      placeholder="搜索"
      onSearch={this.handleSearch}
    />);
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('settings')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="brokers" />
          </div>
        </Sider>
        <Layout>
          <PageHeader title={this.msg('brokers')}>
            <PageHeader.Actions>
              <PrivilegeCover module="clearance" feature="resources" action="create">
                <Button type="primary" onClick={this.handleAddBtnClick} icon="plus">{this.msg('addBroker')}</Button>
              </PrivilegeCover>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions} dataSource={data} columns={columns} rowKey="id" />
            <BrokerModal onOk={this.handleReload} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
