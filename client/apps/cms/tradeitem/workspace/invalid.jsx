import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { notification, Button, Breadcrumb, Layout, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import { loadWorkspaceItems, submitAudit } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import ModuleMenu from '../menu';
import WsItemExportButton from './exportButton';
import makeColumns from './commonCols';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;
const { Option } = Select;

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
    listFilter: state.cmsTradeitem.workspaceListFilter,
    invalidStat: state.cmsTradeitem.workspaceStat.invalid,
  }),
  { loadWorkspaceItems, submitAudit }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class InvalidItemsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentDidMount() {
    this.handleReload(null, null, { status: 'invalid' });
  }
  msg = formatMsg(this.props.intl)
  columns = makeColumns({
    msg: this.msg,
    units: this.props.units,
    tradeCountries: this.props.tradeCountries,
    currencies: this.props.currencies,
    withRepo: true,
    withRepoItem: true,
  }).concat([{
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (_, record) => (<span>
      <RowAction onClick={this.handleItemEdit} icon="edit" label={this.msg('modify')} row={record} />
    </span>),
  }])
  handleItemEdit = (record) => {
    const link = `/clearance/tradeitem/workspace/item/${record.id}`;
    this.context.router.push(link);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, name: value };
    this.props.loadWorkspaceItems({
      pageSize: this.props.workspaceItemList.pageSize,
      current: 1,
      filter: JSON.stringify(filter),
    });
  }
  handleRepoSelect = (repoId) => {
    const filter = { ...this.props.listFilter, repoId };
    this.props.loadWorkspaceItems({
      pageSize: this.props.workspaceItemList.pageSize,
      current: 1,
      filter: JSON.stringify(filter),
    });
  }
  handleReload = (pageSize, current, filter) => {
    let newfilter = this.props.listFilter;
    if (filter) {
      newfilter = { ...newfilter, ...filter };
    }
    this.props.loadWorkspaceItems({
      pageSize: pageSize || this.props.workspaceItemList.pageSize,
      current: current || this.props.workspaceItemList.current,
      filter: JSON.stringify(newfilter),
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleLocalAudit = () => {
    this.props.submitAudit({ auditor: 'local', status: 'invalid' }).then((result) => {
      if (!result.error) {
        if (result.data.feedback === 'submmitted') {
          this.context.router.push('/clearance/tradeitem/workspace/pendings');
        } else if (result.data.feedback === 'reload') {
          this.props.loadWorkspaceItems({
            pageSize: this.props.workspaceItemList.pageSize,
            current: 1,
            filter: JSON.stringify(this.props.listFilter),
          });
          notification.info({ title: '提示', description: '归类已提交审核' });
        } else if (result.data.feedback === 'noop') {
          notification.info({ title: '提示', description: '没有归类可提交审核' });
        }
      }
    });
  }
  handleMasterAudit = () => {
    this.props.submitAudit({ auditor: 'master', status: 'invalid' }).then((result) => {
      if (!result.error) {
        if (result.data.feedback === 'reload') {
          this.props.loadWorkspaceItems({
            pageSize: this.props.workspaceItemList.pageSize,
            current: 1,
            filter: JSON.stringify(this.props.listFilter),
          });
          notification.info({ title: '提示', description: '归类已提交审核' });
        } else if (result.data.feedback === 'noop') {
          notification.info({ title: '提示', description: '没有归类可提交主库审核' });
        }
      }
    });
  }
  render() {
    const {
      workspaceLoading, workspaceItemList, repos, invalidStat, listFilter,
    } = this.props;
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
        const newfilters = { ...listFilter, ...tblfilters[0] };
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
        style={{ width: 160 }}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
        onChange={this.handleRepoSelect}
        allowClear
        value={listFilter.repoId && String(listFilter.repoId)}
      >
        {repos.map(rep =>
          <Option value={String(rep.id)} key={rep.owner_name}>{rep.owner_name}</Option>)}
      </Select>
      <SearchBar placeholder={this.msg('商品货号/HS编码/品名')} onInputSearch={this.handleSearch} value={listFilter.name} />
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
            <ModuleMenu currentKey="invalid" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('taskInvalid')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <WsItemExportButton {...listFilter} onUploaded={this.handleReload} />
              {invalidStat.master && <Button type="primary" icon="save" onClick={this.handleMasterAudit}>提交主库</Button>}
              <Button type="primary" icon="arrow-up" onClick={this.handleLocalAudit}>提交审核</Button>
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
              locale={{ emptyText: '当前没有失效的商品归类' }}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
