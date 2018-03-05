import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Select, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import EditableCell from 'client/components/EditableCell';
import { loadFeeElements, alterFeeElement, deleteFeeElement, toggleNewFeeElementModal } from 'common/reducers/bssSettings';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    feeElements: state.bssSettings.feeElements,
    feeElementMap: state.bssSettings.feeElementMap,
  }),
  {
    loadFeeElements, alterFeeElement, deleteFeeElement, toggleNewFeeElementModal,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class FeeElements extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    feeElements: PropTypes.array.isRequired,
    feeGroups: PropTypes.array.isRequired,
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
  }, {
    title: '所属分组',
    dataIndex: 'fee_group',
    width: 200,
    render: (o, record) =>
      (<Select showSearch defaultValue={o} onChange={value => this.handleAlter(record.id, 'fee_group', value)} style={{ width: '100%' }}>
        {this.props.feeGroups.map(data =>
          <Option key={data.key} value={data.key} search={`${data.search}`}>{`${data.key}|${data.text}`}</Option>)}
      </Select>),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    render: (o, record) => (<span>
      <RowAction onClick={this.handleAdd} icon="plus-circle-o" tooltip="添加子费用元素" row={record} />
      <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={record} />
    </span>),
  }]

  childColumns = [{
    title: '子费用元素代码',
    dataIndex: 'fee_code',
    width: 150,
  }, {
    title: '子费用元素名称',
    dataIndex: 'fee_name',
    width: 200,
    render: (o, record) =>
      <EditableCell value={o} onSave={value => this.handleAlter(record.id, 'fee_name', value)} style={{ width: '100%' }} />,
  }, {
    title: '类型',
    dataIndex: 'fee_type',
    width: 150,
  }, {
    title: '所属分组',
    dataIndex: 'fee_group',
    width: 200,
    render: (o, record) =>
      (<Select showSearch defaultValue={o} onChange={value => this.handleAlter(record.id, 'fee_group', value)} style={{ width: '100%' }}>
        {this.props.feeGroups.map(data =>
          <Option key={data.key} value={data.key} search={`${data.search}`}>{`${data.key}|${data.text}`}</Option>)}
      </Select>),
  }]

  handleLoadItems = () => {
    this.props.loadFeeElements({ tenantId: this.props.tenantId });
  }
  handleAlter = (id, field, value) => {
    const change = {};
    change[field] = value;
    this.props.alterFeeElement({ id, change });
  }
  handleDelete = (row) => {
    this.props.deleteFeeElement(row.fee_code).then((result) => {
      if (!result.error) {
        this.handleLoadItems();
      }
    });
  }
  handleAdd = (row) => {
    this.props.toggleNewFeeElementModal(true, row.fee_code);
  }
  handleExpandDetail = (row) => {
    const data = this.props.feeElementMap[row.fee_code];
    return (
      <Table
        columns={this.childColumns}
        dataSource={data}
        pagination={false}
        bordered
        rowKey="id"
        size="small"
      />
    );
  }
  render() {
    const itemsActions = <SearchBox placeholder={this.msg('itemsSearchTip')} onSearch={this.handleSearchItems} />;
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
        dataSource={this.props.feeElements}
        rowSelection={rowSelection}
        rowKey="fee_code"
        expandedRowRender={this.handleExpandDetail}
      />
    );
  }
}
