import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { notification, Button, Breadcrumb, Layout, Input, Select } from 'antd';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { loadWorkspaceItems, auditItems } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import RowAction from 'client/components/RowAction';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import PageHeader from 'client/components/PageHeader';
import ModuleMenu from '../menu';
import makeColumns from './commonCols';

import { formatMsg } from '../message.i18n';

const { Option } = Select;
const { Sider, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cmsTradeitem.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    repos: state.cmsTradeitem.repos.filter(rep =>
      rep.permission === CMS_TRADE_REPO_PERMISSION.edit),
    workspaceLoading: state.cmsTradeitem.workspaceLoading,
    workspaceItemList: state.cmsTradeitem.workspaceItemList,
  }),
  { loadWorkspaceItems, auditItems }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class PendingItemsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    refuseReason: '',
    filter: { name: '', repoId: '', status: 'pending' },
  }
  componentDidMount() {
    this.handleReload(1);
  }
  msg = formatMsg(this.props.intl)
  columns = makeColumns({
    msg: this.msg,
    units: this.props.units,
    tradeCountries: this.props.tradeCountries,
    currencies: this.props.currencies,
    withRepo: true,
    audit: true,
  }).concat([{
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 180,
    fixed: 'right',
    render: (_, record) => (
      <span>
        <RowAction onClick={this.handleItemPass} icon="check-circle-o" label={this.msg('pass')} row={record} />
        <RowAction
          danger
          popover={<div>
            <Input onChange={this.handleRefuseReason} value={this.state.refuseReason} placeholder="原因" style={{ width: 150 }} />
            <Button type="primary" style={{ marginLeft: 8 }} onClick={() => this.handleItemRefused(record)}>确定</Button>
          </div>}
          icon="close-circle-o"
          label={this.msg('refuse')}
        />
      </span>),
  }])
  handleItemPass = (row) => {
    this.props.auditItems([row.id], { action: 'pass' }).then((result) => {
      if (result.error) {
        notification.error({ title: 'Error', description: result.error.message });
        return;
      }
      this.handleReload(1);
    });
  }
  handleRefuseReason = (ev) => {
    this.setState({ refuseReason: ev.target.value });
  }
  handleItemRefused = (row) => {
    this.props.auditItems([row.id], { action: 'refuse', reason: this.state.refuseReason }).then((result) => {
      if (result.error) {
        notification.error({ title: 'Error', description: result.error.message });
        return;
      }
      this.handleReload(1);
    });
    this.setState({ refuseReason: '' });
  }
  handleBatchPass = () => {
    this.props.auditItems(null, { action: 'pass' }).then((result) => {
      if (result.error) {
        notification.error({ title: 'Error', description: result.error.message });
        return;
      }
      this.handleReload(1);
    });
  }
  handleBatchRefuse = () => {
    this.props.auditItems(null, { action: 'refuse' }).then((result) => {
      if (result.error) {
        notification.error({ title: 'Error', description: result.error.message });
        return;
      }
      this.handleReload(1);
    });
  }
  handleReload = (current, pageSize, filter) => {
    this.props.loadWorkspaceItems({
      pageSize: pageSize || this.props.workspaceItemList.pageSize,
      current: current || this.props.workspaceItemList.current,
      filter: JSON.stringify(filter || this.state.filter),
    });
  }
  handleSearch = (value) => {
    const filter = { ...this.state.filter, name: value };
    this.handleReload(1, null, filter);
    this.setState({ filter });
  }
  handleRepoSelect = (repoId) => {
    const filter = { ...this.state.filter, repoId };
    this.handleReload(1, null, filter);
    this.setState({ filter });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { workspaceLoading, workspaceItemList, repos } = this.props;
    const { filter } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadWorkspaceItems(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...filter, ...tblfilters[0] };
        const params = {
          pageSize: pagination.pageSize,
          current: pagination.current,
          filter: JSON.stringify(newfilters),
        };
        return params;
      },
      remotes: workspaceItemList,
    });
    const toolbarActions = (<span>
      <Select
        showSearch
        placeholder="所属归类库"
        allowClear
        style={{ width: 160 }}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
        onChange={this.handleRepoSelect}
      >
        {repos.map(rep =>
          <Option value={String(rep.id)} key={rep.owner_name}>{rep.owner_name}</Option>)}
      </Select>
      <SearchBar placeholder={this.msg('商品货号/HS编码/品名')} onInputSearch={this.handleSearch} value={filter.name} />
    </span>);
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('tradeitem')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <ModuleMenu currentKey="pending" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('taskReview')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="danger" icon="close-circle-o" onClick={this.handleBatchRefuse}>全部拒绝</Button>
              <Button type="primary" icon="check-circle-o" onClick={this.handleBatchPass}>全部通过</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable
              toolbarActions={toolbarActions}
              selectedRowKeys={this.state.selectedRowKeys}
              handleDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={dataSource}
              rowSelection={rowSelection}
              rowKey="id"
              loading={workspaceLoading}
              locale={{ emptyText: '当前没有待审核的料件' }}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
