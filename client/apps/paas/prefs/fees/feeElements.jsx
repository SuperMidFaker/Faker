import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import EditableCell from 'client/components/EditableCell';
import {
  loadFeeElements, alterFeeElement, deleteFeeElement,
  toggleNewFeeElementModal, changeFeeElementGroup,
} from 'common/reducers/bssFeeSettings';
import { FEE_TYPE } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    feeElementlist: state.bssFeeSettings.feeElementlist,
    listFilter: state.bssFeeSettings.ellistFilter,
    loading: state.bssFeeSettings.elLoading,
  }),
  {
    loadFeeElements,
    alterFeeElement,
    deleteFeeElement,
    toggleNewFeeElementModal,
    changeFeeElementGroup,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class FeeElements extends Component {
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
  itemsColumns = [{
    title: '费用元素代码',
    dataIndex: 'fee_code',
    width: 150,
  }, {
    title: '费用元素名称',
    dataIndex: 'fee_name',
    width: 200,
    render: (o, record) =>
      <EditableCell value={o} onSave={value => this.handleAlter(record.id, 'fee_name', value)} style={{ width: '100%' }} />,
  }, {
    title: '类型',
    dataIndex: 'fee_type',
    width: 150,
    render: (ft) => {
      const type = FEE_TYPE.filter(ftype => ftype.key === ft)[0];
      return type && type.text;
    },
  }, {
    title: '所属分组',
    dataIndex: 'fee_group',
    render: (o, record) => (
      <Select
        showSearch
        defaultValue={o}
        disabled={!!record.parent_fee_code}
        onChange={value => this.handleChangeFeeGroup(record.fee_code, value)}
        style={{ width: '100%' }}
      >
        {this.props.feeGroups.map(data =>
          <Option key={data.key} value={data.key}>{`${data.key}|${data.text}`}</Option>)}
      </Select>),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    fixed: 'right',
    width: 90,
    render: (o, record) => (<span>
      <RowAction onClick={this.handleAdd} icon="plus-circle-o" tooltip="添加子费用元素" row={record} />
      <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={record} />
    </span>),
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadFeeElements(params),
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
    remotes: this.props.feeElementlist,
  })
  handleAlter = (id, field, value) => {
    const change = {};
    change[field] = value;
    this.props.alterFeeElement({ id, change });
  }
  handleDelete = (row) => {
    this.props.deleteFeeElement(row.fee_code).then((result) => {
      if (!result.error) {
        this.props.reload();
      }
    });
  }
  handleChangeFeeGroup = (feeCode, value) => {
    this.props.changeFeeElementGroup(feeCode, value).then((result) => {
      if (!result.error) {
        this.props.reload();
      }
    });
  }
  handleAdd = (row) => {
    this.props.toggleNewFeeElementModal(true, row.fee_code, row.fee_type, row.fee_group);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, code: value };
    this.props.loadFeeElements({
      filter: JSON.stringify(filter),
      pageSize: this.props.feeElementlist.pageSize,
      current: this.props.feeElementlist.current,
    });
  }
  render() {
    const { feeElementlist, loading } = this.props;
    this.dataSource.remotes = feeElementlist;
    const itemsActions = <SearchBox placeholder={this.msg('elementsSearchTip')} onSearch={this.handleSearch} />;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };

    return (
      <DataTable
        toolbarActions={itemsActions}
        selectedRowKeys={this.state.selectedRowKeys}
        columns={this.itemsColumns}
        dataSource={this.dataSource}
        loading={loading}
        rowSelection={rowSelection}
        rowKey="fee_code"
      />
    );
  }
}
