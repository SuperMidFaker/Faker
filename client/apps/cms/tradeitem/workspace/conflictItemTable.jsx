import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Select, notification } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import { delWorkspaceItem, resolveWorkspaceItem } from 'common/reducers/cmsTradeitem';
import RowAction from 'client/components/RowAction';
import makeColumns from './commonCols';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { formatMsg } from '../message.i18n';

const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    loading: state.cmsTradeitem.workspaceLoading,
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
  }),
  { delWorkspaceItem, resolveWorkspaceItem }
)
export default class ConflictItemTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    withRepo: PropTypes.bool,
    loadConflictItems: PropTypes.func.isRequired,
    listFilter: PropTypes.shape({ taskId: PropTypes.number, repoId: PropTypes.number, name: PropTypes.string }),
    noBorder: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    conflictSelRowKeys: [],
    conflictFilter: Object.assign({ status: 'conflict' }, this.props.listFilter),
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.listFilter !== this.props.listFilter && (
      nextProps.listFilter.repoId !== this.props.listFilter.repoId ||
      nextProps.listFilter.name !== this.props.listFilter.name ||
      nextProps.listFilter.taskId !== this.props.listFilter.taskId)
    ) {
      this.setState({ conflictFilter: Object.assign(this.state.conflictFilter, nextProps.listFilter) });
    }
  }
  msg = formatMsg(this.props.intl)
  conflictDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadConflictItems(params),
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
      const newfilters = { ...this.state.conflictFilter, ...tblfilters[0] };
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
      };
      return params;
    },
    remotes: this.props.conflictList,
  })
  conflictColumns = makeColumns({ msg: this.msg,
    units: this.props.units,
    tradeCountries: this.props.tradeCountries,
    currencies: this.props.currencies,
    withRepoItem: true,
    withRepo: this.props.withRepo,
  }).concat([{
    title: '解决状态',
    dataIndex: 'status',
    width: 100,
    fixed: 'right',
    render: (resolved) => {
      if (resolved === 2) {
        return '标准项';
      } else if (resolved === 3) {
        return '非标准项';
      } else if (resolved === 4) {
        return '新来源';
      }
    },
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 140,
    fixed: 'right',
    render: (_, record) => {
      const spanElms = [];
      if (record.classified && record.status === 1) {
        spanElms.push(
          <RowAction key="standard" action="standard" onClick={this.handleConflictResolve} icon="star-o" row={record} tooltip="设为标准" />,
          <RowAction key="stage" action="stage" onClick={this.handleConflictResolve} icon="fork" row={record} tooltip="标记为新来源" />
        );
      }
      return (<span>
        <RowAction onClick={this.handleItemEdit} icon="edit" label={this.msg('modify')} row={record} />
        {spanElms}
        <RowAction confirm={this.msg('deleteConfirm')} onConfirm={this.handleItemDel} icon="delete" row={record} />
      </span>);
    },
  }])
  handleItemEdit = (record) => {
    const link = `/clearance/tradeitem/workspace/item/${record.id}`;
    this.context.router.push(link);
  }
  handleItemDel = (record) => {
    this.props.delWorkspaceItem([record.id]).then((result) => {
      if (!result.error) {
        this.props.loadConflictItems({
          pageSize: this.props.conflictList.pageSize,
          current: this.props.conflictList.current,
          filter: JSON.stringify(this.state.conflictFilter),
        });
      } else {
        notification.error({ title: 'Error', description: result.error.message });
      }
    });
  }
  handleConflictResolve = (item, index, props) => {
    this.props.resolveWorkspaceItem([item.id], props.action).then((result) => {
      if (!result.error) {
        this.props.loadConflictItems({
          pageSize: this.props.conflictList.pageSize,
          current: this.props.conflictList.current,
          filter: JSON.stringify(this.state.conflictFilter),
        });
      } else {
        notification.error({ title: 'Error', description: result.error.message });
      }
    });
  }
  handleRepoSelect = (repoId) => {
    const filter = { ...this.state.conflictFilter, repoId };
    this.props.loadConflictItems({
      pageSize: this.props.conflictList.pageSize,
      current: 1,
      filter: JSON.stringify(filter),
    });
    this.setState({ conflictFilter: filter });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.conflictFilter, name: value };
    this.props.loadConflictItems({
      pageSize: this.props.conflictList.pageSize,
      current: 1,
      filter: JSON.stringify(filter),
    });
    this.setState({ conflictFilter: filter });
  }
  handleRowDeselect= () => {
    this.setState({ conflictSelRowKeys: [] });
  }
  render() {
    const { loading, withRepo, repos, conflictList, noBorder } = this.props;
    const { conflictSelRowKeys } = this.state;
    this.conflictDataSource.remotes = conflictList;
    const conflictSelRows = {
      selectedRowKeys: conflictSelRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ conflictSelRowKeys: selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      {withRepo && <Select showSearch placeholder="所属物料库" optionFilterProp="children" style={{ width: 160 }}
        dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }} onChange={this.handleRepoSelect}
      >
        {repos.map(rep => <Option value={rep.id} key={rep.owner_name}>{rep.owner_name}</Option>)}
      </Select>}
      <SearchBar placeholder={this.msg('商品货号/HS编码/品名')} onInputSearch={this.handleSearch} />
    </span>);
    return (
      <DataTable selectedRowKeys={conflictSelRowKeys} handleDeselectRows={this.handleRowDeselect} loading={loading}
        columns={this.conflictColumns} dataSource={this.conflictDataSource} rowSelection={conflictSelRows} rowKey="id"
        locale={{ emptyText: '当前没有冲突的料件归类' }} toolbarActions={toolbarActions} noBorder={noBorder}
      />
    );
  }
}

