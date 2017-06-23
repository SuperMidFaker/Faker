import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Select, Button, Modal } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import QuantityInput from '../../../common/quantityInput';
import { showPuttingAwayModal } from 'common/reducers/cwmReceive';
import { loadLocations } from 'common/reducers/cwmWarehouse';
import PuttingAwayModal from '../modal/puttingAwayModal';
import { CWM_INBOUND_STATUS } from 'common/constants';

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
  { loadLocations, showPuttingAwayModal }
)
export default class PutawayDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundHead: PropTypes.object.isRequired,
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
    fixed: 'left',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
    fixed: 'left',
  }, {
    title: '实际库位',
    dataIndex: 'location',
    width: 120,
    render: () => {
      const Options = this.props.locations.map(location => (<Option key={location.id} value={location.location}>{location.location}</Option>));
      return (
        <Select style={{ width: 100 }} disabled>
          {Options}
        </Select>);
    },
  }, {
    title: '目标库位',
    dataIndex: 'putaway_location',
    width: 120,
    render: () => {
      const Options = this.props.locations.map(location => (<Option key={location.id} value={location.location}>{location.location}</Option>));
      return (
        <Select style={{ width: 100 }} disabled>
          {Options}
        </Select>);
    },
  }, {
    title: '收货数量',
    width: 180,
    render: (o, record) => (<QuantityInput packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
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
    title: '中文品名',
    dataIndex: 'desc_cn',
  }, {
    title: '上架',
    width: 60,
    dataIndex: 'allocated_by',
  }, {
    title: '上架时间',
    width: 100,
    dataIndex: 'allocated_date',

  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      switch (record.status) {  // 上架明细的状态 0 未上架 1 已上架
        case 0:   // 未上架
          return (<span>
            <RowUpdater onHit={this.handlePutAway} label="上架确认" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleCancelReceived} label="取消收货" row={record} />
          </span>);
        case 1:   // 已上架
          break;
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
    status: 0,
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
      status: 0,
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
    status: 0,
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
    status: 1,
  }];
  handleExpressPutAway = () => {
    Modal.confirm({
      title: '是否确认上架完成?',
      content: '默认将收货库位设为最终储存库位，确认上架后不能操作取消收货',
      onOk() {
        return new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
      },
      onCancel() {},
      okText: '确认上架',
    });
  }
  handlePutAway = () => {
    this.props.showPuttingAwayModal();
  }
  handleBatchConfirmPutAway = () => {
    // this.props.openPickingModal();
  }
  handleCancelReceived = () => {
    // this.props.openShippingModal();
  }
  render() {
    const { inboundHead } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let columns = this.columns;
    if (inboundHead.rec_mode === 'scan') {
      columns = [...columns];
      columns.splice(9, 10);
    }
    return (
      <div>
        <div className="toolbar">
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            <Button size="large" onClick={this.handleBatchConfirmPutAway} icon="check">
              批量上架确认
            </Button>
            <Button size="large" onClick={this.handleBatchConfirmPutAway} icon="rollback">
              批量取消收货
            </Button>
          </div>
          <div className="toolbar-right">
            {inboundHead.rec_mode === 'manual' && inboundHead.status < CWM_INBOUND_STATUS.PARTIAL_PUTAWAY.step &&
            <Button type="primary" ghost size="large" icon="check" onClick={this.handleExpressPutAway}>
              快捷上架
            </Button>
            }
          </div>
        </div>
        <Table columns={columns} rowSelection={rowSelection} indentSize={0} dataSource={this.mockData} rowKey="id"
          scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0) }}
          defaultExpandedRowKeys={[1, 2, 3]}
        />
        <PuttingAwayModal receivingMode={inboundHead.rec_mode} />
      </div>
    );
  }
}
