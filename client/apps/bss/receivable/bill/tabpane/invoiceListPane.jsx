/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.cwmReceive.temporaryDetails,
    loginId: state.account.loginId,
  }),
  { }
)
export default class InvoiceListPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,

  }
  state = {
    selectedRowKeys: [],

  };
  msg = key => formatMsg(this.props.intl, key);

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
      title: '发票号码',
      dataIndex: 'invoice_no',
      width: 150,
    }, {
      title: '购买方',
      dataIndex: 'buyer',
      width: 250,
    }, {
      title: '发票类型',
      dataIndex: 'invoice_type',
      width: 200,
    }, {
      title: '金额',
      dataIndex: 'amount',
      width: 250,
    }, {
      title: '税率',
      width: 100,
      dataIndex: 'tax_rate',
      className: 'cell-align-right',
    }, {
      title: '税金',
      dataIndex: 'tax_amount',
      width: 150,
    }, {
      title: '价税合计',
      dataIndex: 'total_amount',
      width: 150,
    }, {
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '开票申请人',
      dataIndex: 'applied_by',
      width: 150,
    }, {
      title: '申请日期',
      dataIndex: 'applied_date',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: '开票人',
      dataIndex: 'invoiced_by',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: '开票日期',
      dataIndex: 'invoiced_date',
      width: 100,
      className: 'cell-align-right',
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
      <DataPane fullscreen={this.props.fullscreen}
        columns={columns} rowSelection={rowSelection} indentSize={0}
        dataSource={temporaryDetails.map((item, index) => ({ ...item, index }))} rowKey="index" loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.handleTemplateDownload}>添加发票</Button>
          <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
