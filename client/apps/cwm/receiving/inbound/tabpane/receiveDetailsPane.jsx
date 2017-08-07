import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Select, Button, Table, Input } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from '../../../common/popover/packagePopover';
import ReceivingModal from '../modal/receivingModal';
import QuantityInput from '../../../common/quantityInput';
import BatchReceivingModal from '../modal/batchReceivingModal';
import { openReceiveModal, loadInboundProductDetails, showBatchReceivingModal, expressReceive } from 'common/reducers/cwmReceive';
import { CWM_INBOUND_STATUS } from 'common/constants';

const Option = Select.Option;
const Search = Input.Search;

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
    searchValue: '',
    loading: false,
  }
  componentWillMount() {
    this.handleReload();
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleReload();
    }
  }
  handleReload = () => {
    this.setState({ loading: true });
    this.props.loadInboundProductDetails(this.props.inboundNo).then(() => {
      this.setState({ loading: false });
    });
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
  handleManualReceive = (record) => {
    this.props.openReceiveModal({
      editable: true,
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
  handleReceiveDetails = (record) => {
    this.props.openReceiveModal({
      editable: false,
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
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 50,
    className: 'cell-align-center',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: o => (<PackagePopover sku={o} />),
  }, {
    title: '预期数量',
    width: 180,
    render: (o, record) => (<QuantityInput size="small" packQty={record.expect_pack_qty} pcsQty={record.expect_qty} disabled />),
  }, {
    title: '收货数量',
    width: 180,
    render: (o, record) => (<QuantityInput size="small" packQty={record.received_pack_qty} pcsQty={record.received_qty}
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
          <Select size="small" className="readonly" value={o[0]} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      } else {
        return (
          <Select size="small" className="readonly" mode="tags" value={o} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      }
    },
  }, {
    title: '包装情况',
    dataIndex: 'damage_level',
    width: 120,
    render: damage => (
      <Select size="small" className="readonly" value={damage} style={{ width: 100 }} disabled>
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
    title: '收货人员',
    width: 100,
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
      if (this.props.inboundHead.rec_mode === 'scan' ||
        this.props.inboundHead.status === CWM_INBOUND_STATUS.COMPLETED.value ||
        record.expect_qty === record.received_qty) {
        return (<RowUpdater onHit={this.handleReceiveDetails} label="收货记录" row={record} />);
      } else {
        return (<RowUpdater onHit={this.handleManualReceive} label="收货确认" row={record} />);
      }
    },
  }]
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  render() {
    const { inboundHead, inboundProducts } = this.props;
    const dataSource = inboundProducts.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      } else {
        return true;
      }
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
      selections: [{
        key: 'all-data',
        text: '选择全部项',
        onSelect: () => {
          const selectedRowKeys = dataSource.map(item => item.asn_seq_no);
          this.setState({
            selectedRowKeys,  // TODO
            selectedRows: dataSource,
          });
        },
      }],
      getCheckboxProps: record => ({
        disabled: record.trace_id.length >= 1,
      }),
    };
    return (
      <div className="table-fixed-layout">
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            {inboundHead.rec_mode === 'manual' &&
            <Button size="large" onClick={this.handleBatchProductReceive}>
              批量收货确认
            </Button>
            }
          </div>
          {/* <div className="toolbar-right">
            {inboundHead.rec_mode === 'manual' && inboundHead.status === CWM_INBOUND_STATUS.CREATED.value &&
            <Button size="large" icon="check" onClick={this.handleExpressReceived}>
              快捷收货
            </Button>
            }
          </div> */}
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="asn_seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
          loading={this.state.loading}
        />
        <ReceivingModal />
        <BatchReceivingModal inboundNo={this.props.inboundNo} data={this.state.selectedRows} />
      </div>
    );
  }
}
