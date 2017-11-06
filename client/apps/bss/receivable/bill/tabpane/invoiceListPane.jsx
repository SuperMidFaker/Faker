/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
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
      title: '发票号',
      dataIndex: 'seq_no',
      width: 50,
      className: 'cell-align-center',
      render: (col, row) => row.index + 1,
    }, {
      title: '发票类型',
      dataIndex: 'product_no',
      width: 200,
      fixed: 'left',
    }, {
      title: '金额',
      dataIndex: 'name',
      width: 250,
    }, {
      title: '税率',
      width: 100,
      dataIndex: 'order_qty',
      className: 'cell-align-right',

    }, {
      title: '税金',
      dataIndex: 'po_no',
      width: 150,
    }, {
      title: '含税总金额',
      dataIndex: 'container_no',
      width: 150,
    }, {
      title: '开票申请人',
      dataIndex: 'virtual_whse',
      width: 150,
    }, {
      title: '开票人',
      dataIndex: 'amount',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (o, record) => (
        <span>
          <RowUpdater onHit={this.handleEdit} label={<Icon type="edit" />} row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={() => this.handleDelete(record.index)} label={<Icon type="delete" />} row={record} />
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
