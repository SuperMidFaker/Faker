/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
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
export default class PaymentReceivedPane extends Component {
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
    const { temporaryDetails } = this.props;

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: '收款流水号',
      dataIndex: 'seq_no',
      width: 150,
      fixed: 'left',
    }, {
      title: '发票号码',
      dataIndex: 'invoice_no',
      width: 150,
    }, {
      title: '付款方',
      dataIndex: 'payer',
      width: 200,
    }, {
      title: '金额',
      dataIndex: 'amount',
      width: 250,
    }, {
      title: '支付方式',
      width: 100,
      dataIndex: 'pay_mode',
      align: 'right',
    }, {
      title: '收款日期',
      dataIndex: 'payment_date',
      width: 150,
    }, {
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (o, record) => (
        <span>
          <RowAction onClick={this.handleEdit} label={<Icon type="edit" />} row={record} />
          <span className="ant-divider" />
          <RowAction onClick={() => this.handleDelete(record.index)} label={<Icon type="delete" />} row={record} />
        </span>
      ),
    }];
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={temporaryDetails.map((item, index) => ({ ...item, index }))}
        rowKey="index"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Button icon="plus-circle-o" onClick={this.handleTemplateDownload}>记录收款</Button>
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
