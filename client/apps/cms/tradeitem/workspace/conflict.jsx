import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Breadcrumb, Layout, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { loadWorkspaceItems } from 'common/reducers/cmsTradeitem';
import ModuleMenu from '../menu';
import makeColumns from './commonCols';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;
const Option = Select.Option;

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
    repos: state.cmsTradeitem.repos.filter(rep => rep.permission === CMS_TRADE_REPO_PERMISSION.edit),
    loading: state.cmsTradeitem.workspaceLoading,
    workspaceItemList: state.cmsTradeitem.workspaceItemList,
  }),
  { loadWorkspaceItems }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class ConflictItemsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    filter: { repoId: '', name: '', status: 'emerge' },
  }
  componentDidMount() {
    this.props.loadWorkspaceItems({
      pageSize: this.props.workspaceItemList.pageSize,
      current: 1,
      filter: JSON.stringify(this.state.filter),
    });
  }
  msg = formatMsg(this.props.intl)
  columns = makeColumns(this.msg, this.props.units, this.props.tradeCountries, this.props.currencies).concat([{
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
  }])
  handleSearch = (value) => {
    const filter = { ...this.props.filter, name: value };
    this.props.loadWorkspaceItems({
      pageSize: this.props.workspaceItemList.pageSize,
      current: 1,
      filter: JSON.stringify(filter),
    });
    this.setState({ filter });
  }
  handleRepoSelect = (repoId) => {
    const filter = { ...this.state.filer, repoId };
    this.props.loadWorkspaceItems({
      pageSize: this.props.workspaceItemList.pageSize,
      current: 1,
      filter: JSON.stringify(filter),
    });
    this.setState({ filter });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { loading, workspaceItemList, repos } = this.props;
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
        const newfilters = { ...this.state.filter, ...tblfilters[0] };
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
      <Select showSearch placeholder="所属物料库" optionFilterProp="children" style={{ width: 160 }}
        dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }} onChange={this.handleRepoSelect}
      >
        {repos.map(rep => <Option value={rep.id}>{rep.owner_name}</Option>)}
      </Select>
      <SearchBar placeholder={this.msg('商品货号/HS编码/品名')} onInputSearch={this.handleSearch} />
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
            <ModuleMenu currentKey="conflict" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('taskConflict')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button icon="file-excel">导出</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions}
              selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
              columns={this.columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="it" loading={loading}
              locale={{ emptyText: '当前没有新的料件' }}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
