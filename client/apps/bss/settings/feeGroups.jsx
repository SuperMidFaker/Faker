import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import EditableCell from 'client/components/EditableCell';
import { loadFeeGroups, deleteFeeGroup, alterFeeGroupName } from 'common/reducers/bssSettings';
import { formatMsg, formatGlobalMsg } from './message.i18n';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    feeGroups: state.bssSettings.feeGroups,
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
    tenantId: PropTypes.number.isRequired,
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
  groupsColumns = [{
    title: '费用分组代码',
    dataIndex: 'fee_group_code',
    width: 200,
  }, {
    title: '费用分组名称',
    dataIndex: 'fee_group_name',
    width: 300,
    render: (o, record) =>
      <EditableCell value={o} onSave={value => this.handleAlterGName(record.id, value)} style={{ width: '100%' }} />,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    render: (o, record) => <RowAction confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDeleteFeeGroup} icon="delete" row={record} />,
  }]

  handleLoadGroups = () => {
    this.props.loadFeeGroups({ tenantId: this.props.tenantId });
  }
  handleDeleteFeeGroup = (row) => {
    this.props.deleteFeeGroup(row.id).then((result) => {
      if (!result.error) {
        this.handleLoadGroups();
      }
    });
  }
  handleAlterGName = (id, val) => {
    this.props.alterFeeGroupName({ groupName: val, id });
  }
  render() {
    const { feeGroups } = this.props;
    const groupsActions = <SearchBox placeholder={this.msg('groupsSearchTip')} onSearch={this.handleSearchGroups} />;
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
        dataSource={feeGroups}
        rowSelection={rowSelection}
        rowKey="id"
      />
    );
  }
}
