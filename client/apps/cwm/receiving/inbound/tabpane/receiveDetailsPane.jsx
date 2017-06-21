import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Tag, Icon, Button } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import QuantityInput from '../../../common/quantityInput';
import { openPickingModal, openShippingModal } from 'common/reducers/cwmOutbound';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { openPickingModal, openShippingModal }
)
export default class ReceiveDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }

  columns = [{
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 150,
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
    title: '收货数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: '目标库位',
    dataIndex: 'putaway_location',
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
    width: 150,
  }, {
    title: '上架',
    width: 100,
    dataIndex: 'allocated_date',
    render: (o, record) => {
      if (o) {
        return (<div>
          <div><Icon type="user" />{record.allocated_by}</div>
          <div><Icon type="clock-circle-o" />{record.allocated_date}</div>
        </div>);
      }
    },
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      switch (record.status) {  // 分配明细的状态 2 已分配 4 已拣货 6 已发运
        case 2:   // 已分配
          return (<span>
            <RowUpdater onHit={this.handleConfirmPicked} label="上架确认" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleCancelAllocated} label="取消收货" row={record} />
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
    status: 0,
    allocated_by: '张申',
    allocated_date: '2017-06-12',
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
    status: 1,
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
    status: 2,
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
    status: 3,
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
    status: 4,
  }];
  handleConfirmPicked = () => {
    this.props.openPickingModal();
  }
  handleConfirmShipped = () => {
    this.props.openShippingModal();
  }
  handleBatchConfirmPicked = () => {
    this.props.openPickingModal();
  }
  handleBatchConfirmShipped = () => {
    this.props.openShippingModal();
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
            <Button size="large" onClick={this.handleBatchConfirmPicked} icon="rollback">
              批量拣货确认
            </Button>
            <Button size="large" onClick={this.handleBatchConfirmShipped} icon="rollback">
              批量发货确认
            </Button>
          </div>
          <div className="toolbar-right">
            {this.state.allocated && this.state.shippingMode === 'scan' && !this.state.pushedTask &&
            <Button type="primary" size="large" onClick={this.handlePushTask} icon="tablet">推送拣货任务</Button>}
            {this.state.allocated && this.state.shippingMode === 'scan' && this.state.pushedTask &&
            <Button size="large" onClick={this.handleWithdrawTask} icon="rollback" />}

          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.mockData} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
