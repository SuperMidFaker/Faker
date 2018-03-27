/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { updateReconcile, acceptStatement } from 'common/reducers/bssBill';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

@injectIntl
@connect(
  () => ({
  }),
  { updateReconcile, acceptStatement }
)
export default class ReconciliationPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dataSource: PropTypes.arrayOf(PropTypes.shape({
      sof_order_no: PropTypes.string,
      cust_order_no: PropTypes.string,
    })),
    billNo: PropTypes.string,
  }
  state = {
    selectedRowKeys: [],
    reconcileStatements: [],
    editItem: {},
    currentPage: 1,
  };
  componentWillMount() {
    this.setState({
      reconcileStatements: this.props.dataSource,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      this.setState({
        reconcileStatements: nextProps.dataSource,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleEdit = (row) => {
    this.setState({
      editItem: row,
    });
  }
  handleColumnChange = (field, value) => {
    const amount = parseInt(value, 10);
    const editItem = { ...this.state.editItem };
    if (!Number.isNaN(amount)) {
      editItem[field] = amount;
    } else {
      editItem[field] = null;
    }
    if (!Number.isNaN(editItem.buyer_settled_amount)
    && !Number.isNaN(editItem.seller_settled_amount)) {
      editItem.diff_settled_amount = editItem.buyer_settled_amount - editItem.seller_settled_amount;
    } else {
      editItem.diff_settled_amount = null;
    }
    this.setState({
      editItem,
    });
  }
  handleOk = () => {
    const item = { ...this.state.editItem };
    const reconcileStatements = [...this.props.dataSource];
    const index = reconcileStatements.findIndex(data => data.id === item.id);
    let delta;
    if (item.settle_type === 1) {
      delta = item.seller_settled_amount - reconcileStatements[index].seller_settled_amount;
    } else {
      delta = item.buyer_settled_amount - reconcileStatements[index].buyer_settled_amount;
    }
    reconcileStatements[index] = item;
    item.delta = delta;
    this.props.updateReconcile(item, this.props.billNo).then((result) => {
      if (!result.error) {
        this.setState({
          reconcileStatements,
          editItem: {},
        });
      }
    });
  }
  handleAccept = (row) => {
    const reconcileStatements = [...this.props.dataSource];
    const index = reconcileStatements.findIndex(data => data.id === row.id);
    const item = reconcileStatements[index];
    if (row.settle_type === 1) {
      item.delta = item.buyer_settled_amount - item.seller_settled_amount;
      item.seller_settled_amount = item.buyer_settled_amount;
      item.reconciled_amount = item.buyer_settled_amount;
    } else {
      item.delta = item.seller_settled_amount - item.buyer_settled_amount;
      item.buyer_settled_amount = item.seller_settled_amount;
      item.reconciled_amount = item.seller_settled_amount;
    }
    item.diff_settled_amount = 0;
    reconcileStatements[index] = item;
    this.props.acceptStatement(item, this.props.billNo).then((result) => {
      if (!result.error) {
        this.setState({
          reconcileStatements,
        });
      }
    });
  }
  handleCancel = () => {
    this.setState({
      editItem: {},
    });
  }
  handleSearch = (value) => {
    let reconcileStatements = [...this.props.dataSource];
    if (value) {
      reconcileStatements = this.props.dataSource.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.cust_order_no) || reg.test(item.sof_order_no);
      });
    }
    this.setState({ reconcileStatements, currentPage: 1 });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: '业务编号',
      dataIndex: 'sof_order_no',
      width: 150,
    }, {
      title: '客户单号',
      dataIndex: 'cust_order_no',
      width: 150,
    }, {
      title: '对方金额',
      dataIndex: 'buyer_amount',
      width: 150,
      align: 'right',
      render: (o, record) => {
        if (record.settle_type === 1) {
          return record.buyer_settled_amount;
        }
        return record.seller_settled_amount;
      },
    }, {
      title: '我方金额',
      dataIndex: 'seller_amount',
      width: 150,
      align: 'right',
      render: (o, record) => {
        if (this.state.editItem.id === record.id) {
          if (this.state.editItem.settle_type === 1) {
            return (<Input
              value={this.state.editItem.seller_settled_amount}
              onChange={e => this.handleColumnChange('seller_settled_amount', e.target.value)}
            />);
          }
          return (<Input
            value={this.state.editItem.buyer_settled_amount}
            onChange={e => this.handleColumnChange('buyer_settled_amount', e.target.value)}
          />);
        }
        return record.settle_type === 1 ?
          record.seller_settled_amount : record.buyer_settled_amount;
      },
    }, {
      title: '差异金额',
      dataIndex: 'diff_settled_amount',
      width: 150,
      align: 'right',
      render: (o, record) => {
        if (this.state.editItem.id === record.id) {
          return this.state.editItem.diff_settled_amount;
        }
        return o;
      },
    }, {
      title: '最终认可金额',
      dataIndex: 'reconciled_amount',
      width: 150,
      align: 'right',
    }, {
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '操作',
      width: 90,
      fixed: 'right',
      render: (o, record) => {
        if (this.props.status === 'unaccepted') {
          if (this.state.editItem.id === record.id) {
            return (<span>
              <RowAction icon="save" onClick={this.handleOk} tooltip={this.gmsg('confirm')} row={record} />
              <RowAction icon="close" onClick={this.handleCancel} tooltip={this.gmsg('cancel')} row={record} />
            </span>);
          }
          return (<span>
            <RowAction icon="like-o" onClick={this.handleAccept} tooltip={this.msg('accept')} row={record} />
            <RowAction icon="edit" onClick={this.handleEdit} tooltip={this.gmsg('edit')} row={record} />
          </span>);
        }
        return null;
      },
    }];
    return (
      <DataPane
        columns={columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={this.state.reconcileStatements}
        rowKey="index"
        pagination={{
          current: this.state.currentPage,
          defaultPageSize: 10,
          onChange: this.handlePageChange,
        }}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
