import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Tag, Popconfirm, Input, Tooltip, Button } from 'antd';
import RowUpdater from 'client/components/rowUpdater';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { }
)
export default class AllocDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }

  columns = [{
    title: '订单行号',
    dataIndex: 'seq_no',
    width: 50,
  }, {
    title: 'SKU',
    dataIndex: 'sku',
    width: 200,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '批次号',
    dataIndex: 'lot_no',
    width: 100,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
    width: 120,

  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '分配时间',
    dataIndex: 'allocated_date',
    width: 120,
  }, {
    title: '拣货时间',
    dataIndex: 'picked_date',
    width: 120,
  }, {
    title: '复核时间',
    dataIndex: 'verified_date',
    width: 120,
  }, {
    title: '发运时间',
    dataIndex: 'shipped_date',
    width: 120,
  }, {
    title: '分配数量',
    width: 200,
    render: (o, record) => (<span><Tooltip title="包装单位数量"><Input className="readonly" value={record.expect_pack_qty} style={{ width: 80 }} /></Tooltip>
      <Tooltip title="主单位数量"><Input value={record.expect_qty} style={{ width: 80 }} disabled /></Tooltip></span>),
  }, {
    title: '分配异常',
    dataIndex: 'allocate_exception',
  }, {
    title: '操作',
    render: (o, record) => (<RowUpdater onHit={this.handleManualAllocate} label="指定分配" row={record} />),
  }]
  mockData = [{
    id: 1,
    seq_no: '1',
    product_no: 'N04601170548',
    order_qty: 15,
    desc_cn: '微纤维止血胶原粉',
    sku: 'N04601170548',
    allocate_rule: 'FIFO',
    unit: '件',
    sku_pack: '单件',
    expect_pack_qty: 15,
    expect_qty: 15,
    received_pack_qty: 15,
    received_qty: 15,
  }, {
    id: 4,
    seq_no: '2',
    product_no: 'N04601170547',
    order_qty: 1000,
    desc_cn: 'PTA球囊扩张导管',
    sku: 'N04601170547',
    allocate_rule: 'FIFO',
    unit: '件',
    location: 'P1CA0101',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    id: 5,
    seq_no: '3',
    product_no: 'SBMG-00859',
    order_qty: 1000,
    desc_cn: '临时起搏电极导管',
    sku: 'RS2A03A0AL0W00',
    allocate_rule: 'FIFO',
    unit: '个',
    location: 'P1CA0101',
    expect_pack_qty: 10,
    expect_qty: 1000,
    received_pack_qty: 0,
    received_qty: 0,
  }, {
    id: 6,
    seq_no: '4',
    product_no: 'SBME-00787',
    order_qty: 12,
    desc_cn: '肾造瘘球囊扩张导管',
    sku: '109R0612D401',
    allocate_rule: 'FIFO',
    unit: '个',
    expect_pack_qty: 2,
    location: 'P1CA0101',
    expect_qty: 12,
    received_pack_qty: 1,
    received_qty: 6,
  }, {
    id: 7,
    seq_no: '5',
    product_no: 'SBMJ-00199',
    order_qty: 1,
    desc_cn: '输尿管镜球囊扩张导管',
    sku: '9GV0912P1G03',
    allocate_rule: 'FIFO',
    unit: '个',
    expect_pack_qty: 1,
    location: 'P1CA0101',
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
      <div>
        <div className="toolbar">
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
          </div>
          <div className="toolbar-right">
            {this.state.allocated && this.state.shippingMode === 'scan' && !this.state.pushedTask &&
            <Button type="primary" size="large" onClick={this.handlePushTask} icon="tablet">推送拣货任务</Button>}
            {this.state.allocated && this.state.shippingMode === 'scan' && this.state.pushedTask &&
            <Button size="large" onClick={this.handleWithdrawTask} icon="rollback" />}
            {this.state.allocated && this.state.shippingMode === 'manual' &&
            <Popconfirm title="确定此次拣货已完成?" onConfirm={this.handleConfirmPicked} okText="确认" cancelText="取消">
              <Button type={this.state.printedPickingList && 'primary'} size="large" icon="check" disabled={this.state.picked}>
                          拣货确认
                        </Button>
            </Popconfirm>
                      }
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.mockData} rowKey="id" />
      </div>
    );
  }
}
