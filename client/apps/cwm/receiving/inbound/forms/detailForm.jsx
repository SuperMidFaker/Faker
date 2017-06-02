/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Button, Card, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import RowUpdater from 'client/components/rowUpdater';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class DetailForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '序号',
    dataIndex: 'seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
    width: 200,
  }, {
    title: '订单数量',
    dataIndex: 'order_qty',
  }, {
    title: '单位',
    dataIndex: 'unit',
  }, {
    title: '包装代码',
    dataIndex: 'packing_code',
  }, {
    title: '收货包装',
    dataIndex: 'receive_pack',
  }, {
    title: '预期数量',
    dataIndex: 'expect_pack_qty',
  }, {
    title: '已收数量',
    dataIndex: 'received_pack_qty',
  }, {
    title: '操作',
    render: (o, record) => {
      if (record.status === 0 && record.receiving_lock === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="收货" row={record} /><span className="ant-divider" /><RowUpdater label="派单" row={record} /></span>);
      } else if (record.status === 0 && record.receiving_lock === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else if (record.status === 1) {

      }
    },
  }]
  dataSource = [{
    seq_no: '1',
    product_no: 'N04601170548',
    order_qty: 1,
    desc_cn: '0961|希雅路仓库',
    packing_code: 'STANDARD',
    unit: '件',
    expect_pack_qty: 0,
    receive_pack: '主单位',
  }, {
    seq_no: '2',
    product_no: 'N04601170547',
    order_qty: 0,
    desc_cn: '0086|物流大道仓库',
    packing_code: 'STANDARD',
    unit: '件',
    expect_pack_qty: 1,
    receive_pack: '内包装',
  }, {
    seq_no: '3',
    product_no: 'N04601170546',
    order_qty: 1,
    desc_cn: '0962|富特路仓库',
    packing_code: 'STANDARD',
    unit: '个',
    expect_pack_qty: 2,
    receive_pack: '内包装',
  }, {
    seq_no: '4',
    product_no: 'N04601170546',
    order_qty: 1,
    desc_cn: '0962|富特路仓库',
    packing_code: 'STANDARD',
    unit: '个',
    expect_pack_qty: 2,
    receive_pack: '箱',
  }, {
    seq_no: '5',
    product_no: 'N04601170546',
    order_qty: 1,
    desc_cn: '0962|富特路仓库',
    packing_code: 'STANDARD',
    unit: '个',
    expect_pack_qty: 3,
    receive_pack: '托盘',
  }];
  render() {
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <div className="toolbar">
          <Button>快捷收货</Button>
        </div>
        <Table columns={this.columns} dataSource={this.dataSource} rowKey="seq_no" />
      </Card>
    );
  }
}
