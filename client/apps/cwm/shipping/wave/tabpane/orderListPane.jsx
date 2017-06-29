import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button } from 'antd';
import { openAllocatingModal } from 'common/reducers/cwmOutbound';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { openAllocatingModal }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }

  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 40,
  }, {
    title: 'SO编号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '订单类型',
    dataIndex: 'order_type',
  }, {
    title: '状态',
    dataIndex: 'order_status',
  }, {
    title: '货主',
    dataIndex: 'owner',
  }, {
    title: '收货人',
    dataIndex: 'receiver',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '承运人',
    dataIndex: 'carrier',
    width: 60,
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
  }, {
    title: '要求出货日期',
    dataIndex: 'expect_shipping_date',
    width: 120,
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
    status: -1,
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
    status: 0,
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
    status: 1,
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
    status: 1,
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
    status: 1,
  }];
  handleSKUAllocateDetails = () => {
    this.props.openAllocatingModal();
  }
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
            <Button size="large" onClick={this.handleWithdrawTask} icon="close">
              移除订单
            </Button>
          </div>
          <div className="toolbar-right" />
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.mockData} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
