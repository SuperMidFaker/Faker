import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Select, Icon, Button, Input } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import QuantityInput from '../../../common/quantityInput';
import { loadLocations } from 'common/reducers/cwmWarehouse';

const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    locations: state.cwmWarehouse.locations,
  }),
  { loadLocations }
)
export default class PutawayDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadLocations(this.props.defaultWhse.code);
  }

  columns = [{
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 150,
  }, {
    title: '追踪号',
    dataIndex: 'trace_id',
    width: 180,
    render: o => (<Input className="readonly" prefix={<Icon type="qrcode" />} value={o} />),
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
    width: 180,
    render: (o, record) => {
      const Options = this.props.locations.map(location => (<Option key={location.id} value={location.location}>{location.location}</Option>));
      if (record.location && record.location.length <= 1) {
        return (
          <Select value={o[0]} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      } else {
        return (
          <Select mode="tags" value={o} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      }
    },
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
  }, {
    title: '上架',
    width: 100,
    dataIndex: 'allocated_by',
  }, {
    title: '上架时间',
    width: 100,
    dataIndex: 'allocated_date',

  }, {
    title: '操作',
    width: 150,
    render: (o, record) => {
      switch (record.status) {  // 分配明细的状态 2 已分配 4 已拣货 6 已发运
        case 1:   // 已分配
          return (<span>
            <RowUpdater onHit={this.handleCancelAllocated} label="取消收货" row={record} />
          </span>);
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
    convey_no: 'CV66883444',
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
    status: 2,
    allocated_by: '张申',
    allocated_date: '2017-06-12',
    children: [{
      id: 2,
      convey_no: 'CV66883444',
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
      id: 3,
      convey_no: 'CV66883444',
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
    },
    ],
  }, {
    id: 4,
    convey_no: 'CV66883445',
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
    status: 2,
  }, {
    id: 5,
    convey_no: 'CV66883446',
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
