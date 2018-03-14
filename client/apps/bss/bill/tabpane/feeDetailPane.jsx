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
export default class FeeDetailPane extends Component {
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
      title: '业务流水号',
      dataIndex: 'biz_seq_no',
      width: 180,
    }, {
      title: '费用名称',
      dataIndex: 'fee',
    }, {
      title: '费用种类',
      dataIndex: 'fee_category',
      width: 100,
    }, {
      title: '费用类型',
      dataIndex: 'fee_type',
      width: 100,
    }, {
      title: '营收金额(人民币)',
      dataIndex: 'amount_rmb',
      width: 150,
    }, {
      title: '外币金额',
      dataIndex: 'amount_forc',
      width: 150,
    }, {
      title: '外币币制',
      dataIndex: 'currency',
      width: 100,
    }, {
      title: '汇率',
      dataIndex: 'currency_rate',
      width: 100,
    }, {
      title: '调整金额',
      dataIndex: 'adj_amount',
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
          <Button icon="download" onClick={this.handleTemplateDownload}>导出</Button>
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
