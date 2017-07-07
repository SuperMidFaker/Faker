import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import QuantityInput from '../../../common/quantityInput';
import { openAllocatingModal } from 'common/reducers/cwmOutbound';
import { loadWaveDetails } from 'common/reducers/cwmShippingOrder';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { openAllocatingModal, loadWaveDetails }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {

  }
  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 40,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
  }, {
    title: '订货数量',
    dataIndex: 'order_qty',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '计量单位',
    dataIndex: 'unit_name',
    width: 60,
  }, {
    title: 'SKU',
    dataIndex: 'sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: '拣货数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.picked_pack_qty} pcsQty={record.picked_qty} />),
  }, {
    title: '发货数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.shipped_pack_qty} pcsQty={record.shipped_qty} />),
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      switch (record.status) {  // 订单明细的状态 0 未分配 1 部分分配 2 完全分配
        case 0:
          return (<span>
            <RowUpdater onHit={this.handleSKUAutoAllocate} label="自动分配" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleSKUAllocateDetails} label="手动分配" row={record} />
          </span>);
        case 1:
        case 2:
          return (<span>
            <RowUpdater onHit={this.handleSKUAllocateDetails} label="分配明细" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleSKUCancelAllocate} label="取消分配" row={record} />
          </span>);
        default:
          break;
      }
    },
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
            <Button size="large" onClick={this.handleWithdrawTask}>
              <MdIcon type="check-all" />批量自动分配
            </Button>
            <Button size="large" onClick={this.handleWithdrawTask} icon="close">
              批量取消分配
            </Button>
          </div>
          <div className="toolbar-right">
            {!this.state.allocated && <Button size="large" onClick={this.handleAutoAllocate} >合并</Button>}
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.mockData} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
