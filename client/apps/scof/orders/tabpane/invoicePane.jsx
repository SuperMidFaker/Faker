import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import { setClientForm } from 'common/reducers/sofOrders';

import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    recParams: state.scofFlow.cwmParams,
  }),
  { setClientForm }
)
export default class InvoicePane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentDidMount() {
  }
  msg = key => formatMsg(this.props.intl, key)
  invoiceColumns = [{
    title: '发票号',
    dataIndex: 'invoice_no',
  }, {
    title: '发票日期',
    dataIndex: 'invoice_date',
  }, {
    title: '订单号',
    dataIndex: 'order_no',
  }, {
    title: '总价',
    dataIndex: 'total_amount',
  }, {
    title: '币制',
    dataIndex: 'currency',
  }, {
    title: '总净重',
    dataIndex: 'total_net_wt',
  }, {
    dataIndex: 'OPS_COL',
    width: 45,
    render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
  }];

  render() {
    return (
      <DataPane
        columns={this.invoiceColumns}
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o">添加</Button>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
