/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { intlShape, injectIntl } from 'react-intl';
import { updateBill, getBillStatements } from 'common/reducers/bssBill';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    userMembers: state.account.userMembers,
    billHead: state.bssBill.billHead,
    billStatements: state.bssBill.billStatements,
  }),
  { updateBill, getBillStatements }
)
export default class StatementsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    billNo: PropTypes.string.isRequired,
  }
  state = {
    selectedRowKeys: [],
    billStatements: [],
    editItem: {},
    currentPage: 1,
  };
  componentDidMount() {
    this.props.getBillStatements(this.props.billNo).then((result) => {
      if (!result.error) {
        this.setState({
          billStatements: result.data,
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleEdit = (row) => {
    this.setState({
      editItem: row,
    });
  }
  handleColumnChange = (field, value) => {
    const editItem = { ...this.state.editItem };
    const amount = parseInt(value, 10);
    if (!Number.isNaN(amount)) {
      editItem[field] = amount;
    } else {
      editItem[field] = null;
    }
    this.setState({
      editItem,
    });
  }
  handleOk = () => {
    const item = { ...this.state.editItem };
    const billStatements = [...this.props.billStatements];
    const index = billStatements.findIndex(data => data.id === item.id);
    let delta;
    if (item.settle_type === 1) {
      delta = item.seller_settled_amount - billStatements[index].seller_settled_amount;
    } else {
      delta = item.buyer_settled_amount - billStatements[index].buyer_settled_amount;
    }
    billStatements[index] = item;
    item.delta = delta;
    this.props.updateBill(item, this.props.billNo).then((result) => {
      if (!result.error) {
        this.setState({
          billStatements,
          editItem: {},
        });
      }
    });
  }
  handleSearch = (value) => {
    let { billStatements } = this.props;
    if (value) {
      billStatements = this.props.billStatements.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.cust_order_no) || reg.test(item.sof_order_no);
      });
    }
    this.setState({ billStatements, currentPage: 1 });
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
    /* 此处加入各费用项 */
    }, {
      title: '结算金额',
      dataIndex: 'amount',
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
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '订单日期',
      width: 150,
      dataIndex: 'order_date',
      render: o => o && moment(o).format('YYYY/MM/DD'),
    }, {
      title: '审核时间',
      dataIndex: 'confirmed_date',
      width: 150,
      render: o => o && moment(o).format('YYYY/MM/DD'),
    }, {
      title: '审核人员',
      dataIndex: 'confirmed_by',
      width: 150,
      render: o => this.props.userMembers.find(user => user.login_id === o) &&
      this.props.userMembers.find(user => user.login_id === o).name,
    }, {
      title: '操作',
      width: 90,
      fixed: 'right',
      render: (o, record) => {
        if (record.status === 1) {
          if (this.state.editItem.id === record.id) {
            return (<span>
              <RowAction icon="save" onClick={this.handleOk} tooltip={this.gmsg('confirm')} row={record} />
            </span>);
          }
          return (<span>
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
        dataSource={this.state.billStatements}
        rowKey="index"
        loading={this.state.loading}
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
