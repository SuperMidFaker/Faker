/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Button, Card, Input, Table, Tag, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import RowUpdater from 'client/components/rowUpdater';
import messages from '../../message.i18n';
import PackagePopover from '../popover/packagePopover';
import ReceivingModal from '../modal/receivingModal';
import { loadReceiveModal } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({}),
  { loadReceiveModal }
)
export default class DetailForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleReceive = () => {
    this.props.loadReceiveModal();
  }
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
    render: o => (<b>{o}</b>),
  }, {
    title: '主单位',
    dataIndex: 'unit',
  }, {
    title: '包装代码',
    dataIndex: 'packing_code',
    render: o => (
      <PackagePopover data={o} />
      ),
  }, {
    title: '收货包装',
    dataIndex: 'receive_pack',
    render: o => (<Tooltip title="=10主单位" placement="right"><Tag>{o}</Tag></Tooltip>),
  }, {
    title: '预期数量',
    render: (o, record) => (<span><Tooltip title="包装单位数量"><Input className="readonly" value={record.expect_pack_qty} style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input value={record.expect_qty} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '收货数量',
    render: (o, record) => {
      if (record.expect_pack_qty === record.received_pack_qty) {
        return (<span className="mdc-text-green"><Tooltip title="包装单位数量"><Input className="readonly" value={record.received_pack_qty} style={{ width: 80 }} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      } else {
        return (<span className="mdc-text-red"><Tooltip title="包装单位数量"><Input className="readonly" value={record.received_pack_qty} style={{ width: 80 }} /></Tooltip>
          <Tooltip title="主单位数量"><Input value={record.received_qty} style={{ width: 80 }} disabled /></Tooltip></span>);
      }
    },
  }, {
    title: '操作',
    render: (o, record) => {
      if (record.status === 0 && record.receiving_lock === 0) {
        return (<span><span className="ant-divider" /><RowUpdater label="派单" row={record} /></span>);
      } else if (record.status === 0 && record.receiving_lock === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else {
        return (<RowUpdater onHit={this.handleReceive} label="收货" row={record} />);
      }
    },
  }]
  dataSource = [{
    seq_no: '1',
    product_no: 'N04601170548',
    order_qty: 15,
    desc_cn: '微纤维止血胶原粉',
    packing_code: 'STANDARD',
    unit: '件',
    receive_pack: '单件',
    expect_pack_qty: 15,
    expect_qty: 15,
    received_pack_qty: 15,
    received_qty: 15,
  }, {
    seq_no: '2',
    product_no: 'N04601170547',
    order_qty: 1000,
    desc_cn: 'PTA球囊扩张导管',
    packing_code: 'STANDARD',
    unit: '件',
    receive_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '3',
    product_no: 'N04601170546',
    order_qty: 1000,
    desc_cn: '临时起搏电极导管',
    packing_code: 'STANDARD',
    unit: '个',
    receive_pack: '内包装',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    seq_no: '4',
    product_no: 'N04601170546',
    order_qty: 12,
    desc_cn: '肾造瘘球囊扩张导管',
    packing_code: 'STANDARD',
    unit: '个',
    expect_pack_qty: 2,
    receive_pack: '箱',
    expect_qty: 12,
    received_pack_qty: 1,
    received_qty: 6,
  }, {
    seq_no: '5',
    product_no: 'N04601170546',
    order_qty: 1,
    desc_cn: '输尿管镜球囊扩张导管',
    packing_code: 'STANDARD',
    unit: '个',
    expect_pack_qty: 1,
    receive_pack: '托盘',
    expect_qty: 1,
    received_pack_qty: 0,
    received_qty: 0,
  }];
  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <div className="toolbar">
          <Button>快捷收货</Button>
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3><Button>分批收货</Button>
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="seq_no" />
        <ReceivingModal />
      </Card>
    );
  }
}
