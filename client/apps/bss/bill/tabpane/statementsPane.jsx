/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.cwmReceive.temporaryDetails,
    loginId: state.account.loginId,
  }),
  { }
)
export default class StatementsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

  }
  state = {
    selectedRowKeys: [],

  };
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const mockData = [{
      id: 1,
      order_rel_no: '1',
      type: 'FPB',
      status: 0,
    }, {
      id: 2,
      order_rel_no: '2',
      type: 'FPB',
      status: 1,
    }, {
      id: 3,
      order_rel_no: '3',
      type: 'FPB',
      status: 1,
    }, {
      id: 4,
      order_rel_no: '4',
      type: 'BPB',
      status: 0,
    }];
    const columns = [{
      title: '业务编号',
      dataIndex: 'order_rel_no',
      width: 150,
    }, {
      title: '客户单号',
      dataIndex: 'cust_order_no',
      width: 150,
    }, {
      title: '买方金额',
      dataIndex: 'buyer_amount',
      width: 150,
      align: 'right',
    }, {
      title: '应收金额',
      dataIndex: 'seller_amount',
      width: 150,
      align: 'right',
    }, {
      title: '差异金额',
      dataIndex: 'diff_amount',
      width: 150,
      align: 'right',
    }, {
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '订单日期',
      width: 150,
      dataIndex: 'order_date',
    }, {
      title: '结单日期',
      dataIndex: 'closed_date',
      width: 150,
    }, {
      title: '审核时间',
      dataIndex: 'auditted_date',
      width: 150,
    }, {
      title: '审核人员',
      dataIndex: 'auditted_by',
      width: 150,
    }, {
      title: '操作',
      width: 90,
      fixed: 'right',
      render: (o, record) => {
        if (record.status === 0) {
          return (<span>
            <RowAction icon="like-o" onClick={this.handleAccept} tooltip={this.msg('accept')} row={record} />
            <RowAction icon="edit" onClick={this.handleEdit} tooltip={this.gmsg('edit')} row={record} />
          </span>);
        } else if (record.status === 1) {
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
        dataSource={mockData}
        rowKey="index"
        loading={this.state.loading}
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
