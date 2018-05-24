import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import EditableCell from 'client/components/EditableCell';
import { loadFeeGroups, deleteFeeGroup, alterFeeGroupName } from 'common/reducers/bssFeeSettings';
import { formatMsg, formatGlobalMsg } from '../message.i18n';


@injectIntl
@connect(
  state => ({
    feeGroupslist: state.bssFeeSettings.feeGroupslist,
    listFilter: state.bssFeeSettings.gplistFilter,
    loading: state.bssFeeSettings.gpLoading,
  }),
  { loadFeeGroups, deleteFeeGroup, alterFeeGroupName }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class FeeGroups extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    reload: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  groupsColumns = [{
    title: '费用分组代码',
    dataIndex: 'fee_group_code',
    width: 200,
  }, {
    title: '费用分组名称',
    dataIndex: 'fee_group_name',
    render: (o, record) =>
      <EditableCell value={o} onSave={value => this.handleAlterGName(record.id, value)} style={{ width: '100%' }} />,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    fixed: 'right',
    width: 90,
    render: (o, record) => <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDeleteFeeGroup} icon="delete" row={record} />,
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadFeeGroups(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(this.props.listFilter),
      };
      return params;
    },
    remotes: this.props.feeGroupslist,
  })
  handleDeleteFeeGroup = (row) => {
    this.props.deleteFeeGroup(row.id).then((result) => {
      if (!result.error) {
        this.props.reload();
      }
    });
  }
  handleAlterGName = (id, val) => {
    this.props.alterFeeGroupName({ groupName: val, id });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, code: value };
    this.props.loadFeeGroups({
      filter: JSON.stringify(filter),
      pageSize: this.props.feeGroupslist.pageSize,
      current: this.props.feeGroupslist.current,
    });
  }
  render() {
    const { feeGroupslist, loading } = this.props;
    this.dataSource.remotes = feeGroupslist;
    const groupsActions = <SearchBox placeholder={this.msg('groupsSearchTip')} onSearch={this.handleSearch} />;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <DataTable
        toolbarActions={groupsActions}
        selectedRowKeys={this.state.selectedRowKeys}
        columns={this.groupsColumns}
        dataSource={this.dataSource}
        loading={loading}
        rowSelection={rowSelection}
        rowKey="id"
      />
    );
  }
}
