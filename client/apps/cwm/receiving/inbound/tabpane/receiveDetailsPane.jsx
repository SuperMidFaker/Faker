import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Select, Button, Table } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from '../popover/packagePopover';
import ReceivingModal from '../modal/receivingModal';
import QuantityInput from '../../../common/quantityInput';
import BatchReceivingModal from '../modal/batchReceivingModal';
import { openReceiveModal, loadInboundProductDetails, showBatchReceivingModal, expressReceive } from 'common/reducers/cwmReceive';
import { CWM_INBOUND_STATUS } from 'common/constants';

const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    locations: state.cwmWarehouse.locations,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundProducts: state.cwmReceive.inboundProducts,
    reload: state.cwmReceive.inboundReload,
  }),
  { openReceiveModal, loadInboundProductDetails, showBatchReceivingModal, expressReceive }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class ReceiveDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundHead: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    confirmDisabled: true,
  }
  componentWillMount() {
    this.handleReload();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleReload();
    }
  }
  handleReload = () => {
    this.props.loadInboundProductDetails(this.props.inboundNo);
    this.setState({
      selectedRowKeys: [],
    });
  }

  handleBatchProductReceive = () => {
    this.props.showBatchReceivingModal();
  }
  handleExpressReceived = () => {
    const self = this;
    Modal.confirm({
      title: '是否确认收货完成?',
      content: '默认按预期数量收货，确认收货后可以取消收货退回',
      onOk() {
        return self.props.expressReceive(self.props.inboundNo, self.props.loginId);
      },
      onCancel() {},
      okText: '确认收货',
    });
  }
  handleReceive = (record) => {
    this.props.openReceiveModal({
      inboundNo: this.props.inboundNo,
      inboundProduct: record,
      /*
      seqNo: record.asn_seq_no,
      expectQty: record.expect_qty,
      expectPackQty: record.expect_pack_qty,
      receivedQty: record.received_qty,
      receivedPackQty: record.received_pack_qty,
      skuPackQty: record.sku_pack_qty,
      asnNo: this.props.inboundHead.asn_no,
      productNo: record.product_no,
      name: record.name,
      */
    });
  }
  columns = [{
    title: '序号',
    dataIndex: 'asn_seq_no',
    width: 50,
    fixed: 'left',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
    fixed: 'left',
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
    render: o => (<PackagePopover sku={o} />),
  }, {
    title: '预期数量',
    width: 180,
    render: (o, record) => (<QuantityInput packQty={record.expect_pack_qty} pcsQty={record.expect_qty} disabled />),
  }, {
    title: '收货数量',
    width: 180,
    render: (o, record) => (<QuantityInput packQty={record.received_pack_qty} pcsQty={record.received_qty}
      alert={record.expect_pack_qty !== record.receive_pack_qty} disabled
    />),
  }, {
    title: '收货库位',
    dataIndex: 'location',
    width: 180,
    render: (o, record) => {
      const Options = this.props.locations.map(location => (<Option key={location.id} value={location.location}>{location.location}</Option>));
      if (record.location.length <= 1) {
        return (
          <Select className="readonly" value={o[0]} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      } else {
        return (
          <Select className="readonly" mode="tags" value={o} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      }
    },
  }, {
    title: '破损级别',
    dataIndex: 'damage_level',
    width: 120,
    render: damage => (
      <Select className="readonly" value={damage} style={{ width: 100 }} disabled>
        <Option value={0}>完好</Option>
        <Option value={1}>轻微擦痕</Option>
        <Option value={2}>中度</Option>
        <Option value={3}>重度</Option>
        <Option value={4}>严重磨损</Option>
      </Select>),
  }, {
    title: '中文品名',
    dataIndex: 'name',
  }, {
    title: '收货人',
    width: 60,
    dataIndex: 'received_by',
  }, {
    title: '收货时间',
    width: 100,
    dataIndex: 'received_date',
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      const label = this.props.inboundHead.rec_mode === 'scan' || this.props.inboundHead.status === CWM_INBOUND_STATUS.COMPLETED.value ? '收货记录' : '收货确认';
      return (<RowUpdater onHit={this.handleReceive} label={label} row={record} />);
    },
  }]

  render() {
    const { inboundHead, inboundProducts } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
      selections: [{
        key: 'all-data',
        text: '选择全部项',
        onSelect: () => {
          this.setState({
            selectedRowKeys: [...Array(6).keys()],  // TODO
          });
        },
      }],
      getCheckboxProps: record => ({
        disabled: record.trace_id.length >= 1,
      }),
    };
    return (
      <div>
        <div className="toolbar">
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            {inboundHead.rec_mode === 'manual' &&
            <Button size="large" onClick={this.handleBatchProductReceive}>
              批量收货确认
            </Button>
            }
          </div>
          <div className="toolbar-right">
            {inboundHead.rec_mode === 'manual' && inboundHead.status === CWM_INBOUND_STATUS.CREATED.value &&
            <Button size="large" icon="check" onClick={this.handleExpressReceived}>
              快捷收货
            </Button>
            }
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} dataSource={inboundProducts} rowKey="asn_seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
        <ReceivingModal />
        <BatchReceivingModal inboundNo={this.props.inboundNo} data={this.state.selectedRows} />
      </div>
    );
  }
}
