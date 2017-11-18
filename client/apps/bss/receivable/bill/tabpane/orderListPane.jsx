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
export default class OrderListPane extends Component {
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
      title: '订单关联号',
      dataIndex: 'order_rel_no',
      width: 150,
    }, {
      title: '客户单号',
      dataIndex: 'cust_order_no',
      width: 150,
    }, {
      title: '应收金额',
      dataIndex: 'rec_amount',
      width: 150,
      className: 'cell-align-right',
    }, {
      title: '调整金额',
      dataIndex: 'adjust_amount',
      width: 150,
      className: 'cell-align-right',
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
          <Button icon="download" onClick={this.handleTemplateDownload}>导出</Button>
          <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
