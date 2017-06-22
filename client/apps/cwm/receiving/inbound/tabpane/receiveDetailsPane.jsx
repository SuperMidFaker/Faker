import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Modal, Select, Button, Table } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from '../popover/packagePopover';
import ReceivingModal from '../modal/receivingModal';
import QuantityInput from '../../../common/quantityInput';
import BatchReceivingModal from '../modal/batchReceivingModal';
import { openReceiveModal, getInboundDetail, confirm, showBatchReceivingModal, updateInboundMode } from 'common/reducers/cwmReceive';
import { loadLocations } from 'common/reducers/cwmWarehouse';
import { CWM_INBOUND_STATUS } from 'common/constants';

const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    defaultWhse: state.cwmContext.defaultWhse,
    locations: state.cwmWarehouse.locations,
  }),
  { openReceiveModal, getInboundDetail, loadLocations, confirm, showBatchReceivingModal, updateInboundMode }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class ReceiveDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundHead: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    currentStatus: 0,
    inboundProducts: [],
    confirmDisabled: true,
  }
  componentWillMount() {
    this.handleReload();
    this.props.loadLocations(this.props.defaultWhse.code);
  }

  handleReload = () => {
    this.props.getInboundDetail(this.props.inboundNo).then((result) => {
      const inbStatus = Object.keys(CWM_INBOUND_STATUS).filter(
        cis => CWM_INBOUND_STATUS[cis].value === result.data.inboundHead.status
      )[0];
      this.setState({
        inboundProducts: result.data.inboundProducts,
        currentStatus: inbStatus ? CWM_INBOUND_STATUS[inbStatus].step : 0,
        selectedRowKeys: [],
      });
      this.checkConfirm(result.data.inboundProducts);
    });
  }

  handleBatchConfirmReceived = () => {
    this.props.showBatchReceivingModal();
  }
  handleExpressReceived = () => {
    Modal.confirm({
      title: '是否确认收货完成?',
      content: '默认按预期数量收货，确认收货后可以取消收货退回',
      onOk() {
        return new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
      },
      onCancel() {},
      okText: '确认收货',
    });
  }
  handleReceive = (record) => {
    this.props.openReceiveModal({
      inboundNo: record.inbound_no,
      seqNo: record.asn_seq_no,
      expectQty: record.expect_qty,
      expectPackQty: record.expect_pack_qty,
      receivedQty: record.received_qty,
      receivedPackQty: record.received_pack_qty,
      skuPackQty: record.sku_pack_qty,
      asnNo: this.props.inboundHead.asn_no,
      productNo: record.product_no,
      name: record.name,
    });
  }
  handleInboundConfirmed = () => {
    const { loginId, tenantId } = this.props;
    this.props.confirm(this.props.inboundHead.inbound_no, this.props.inboundHead.asn_no, loginId, tenantId);
    this.setState({
      currentStatus: CWM_INBOUND_STATUS.COMPLETED.step,
    });
    this.handleReload();
  }
  checkConfirm = (inboundProducts) => {
    let confirmDisabled = true;
    for (let i = 0; i < inboundProducts.length; i++) {
      if (inboundProducts[i].received_pack_qty !== 0) {
        if (inboundProducts[i].location.length !== 0) {
          confirmDisabled = false;
        } else {
          confirmDisabled = true;
          break;
        }
      }
    }
    this.setState({
      confirmDisabled,
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
    width: 200,
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
    title: '中文品名',
    dataIndex: 'name',
  }, {
    title: '订单数量',
    dataIndex: 'expect_qty',
    width: 80,
    className: 'cell-align-right',
    render: o => (<b>{o}</b>),
  }, {
    title: '主单位',
    dataIndex: 'asn_unit_name',
    width: 80,
  }, {
    title: '收货库位',
    dataIndex: 'location',
    width: 180,
    render: (o, record) => {
      const Options = this.props.locations.map(location => (<Option key={location.id} value={location.location}>{location.location}</Option>));
      if (record.location.length <= 1) {
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
    title: '破损级别',
    dataIndex: 'damage_level',
    width: 120,
    render: damage => (
      <Select value={damage} style={{ width: 100 }} disabled>
        <Option value={0}>完好</Option>
        <Option value={1}>轻微擦痕</Option>
        <Option value={2}>中度</Option>
        <Option value={3}>重度</Option>
        <Option value={4}>严重磨损</Option>
      </Select>),
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (this.props.inboundHead.status < CWM_INBOUND_STATUS.COMPLETED.value) {
        const label = this.props.inboundHead.rec_mode === 'scan' ? '收货记录' : '收货确认';
        return (<RowUpdater onHit={this.handleReceive} label={label} row={record} />);
      }
    },
  }]

  render() {
    const { inboundHead } = this.props;
    const { inboundProducts } = this.state;
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
            <Button size="large" onClick={this.handleBatchConfirmReceived}>
              批量收货确认
            </Button>
            }
          </div>
          <div className="toolbar-right">
            {inboundHead.rec_mode === 'manual' && inboundHead.status < CWM_INBOUND_STATUS.PARTIAL_RECEIVED.step &&
            <Button size="large" icon="check" onClick={this.handleExpressReceived}>
              快捷收货
            </Button>
            }
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} dataSource={inboundProducts} rowKey="asn_seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
        <ReceivingModal reload={this.handleReload} receivingMode={inboundHead.rec_mode} />
        <BatchReceivingModal reload={this.handleReload} asnNo={inboundHead.asn_no} inboundNo={inboundHead.inbound_no} data={this.state.selectedRows} />
      </div>
    );
  }
}
