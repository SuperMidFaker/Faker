import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Popconfirm, Select, Button, Tag, Table, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from 'client/components/rowUpdater';
import PackagePopover from '../popover/packagePopover';
import ReceivingModal from '../modal/receivingModal';
import QuantityInput from '../../../common/quantityInput';
import ExpressReceivingModal from '../modal/expressReceivingModal';
import { openReceiveModal, getInboundDetail, confirm, showExpressReceivingModal, updateInboundMode } from 'common/reducers/cwmReceive';
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
  { openReceiveModal, getInboundDetail, loadLocations, confirm, showExpressReceivingModal, updateInboundMode }
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

  handleExpressReceiving = () => {
    this.props.showExpressReceivingModal();
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
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
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
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 200,
    render: o => (<PackagePopover data={o} />),
  }, {
    title: 'SKU包装单位',
    dataIndex: 'sku_pack_unit_name',
    render: (puname, row) => (<Tooltip title={`=${row.sku_pack_qty}主单位`} placement="right"><Tag>{puname}</Tag></Tooltip>),
  }, {
    title: '预期数量',
    width: 180,
    fixed: 'right',
    render: (o, record) => (<QuantityInput packQty={record.expect_pack_qty} pcsQty={record.expect_qty} disabled />),
  }, {
    title: '收货数量',
    width: 180,
    fixed: 'right',
    render: (o, record) => (<QuantityInput packQty={record.received_pack_qty} pcsQty={record.received_qty}
      alert={record.expect_pack_qty !== record.receive_pack_qty} disabled
    />),
  }, {
    title: '收货库位',
    dataIndex: 'location',
    fixed: 'right',
    width: 180,
    render: (o, record) => {
      const Options = this.props.locations.map(location => (<Option value={location.location}>{location.location}</Option>));
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
    fixed: 'right',
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
        const label = this.props.inboundHead.rec_mode === 'scan' ? '扫码收货' : '手动收货';
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
            <Button size="large" onClick={this.handleExpressReceiving}>
              快捷收货
            </Button>
            }
          </div>
          <div className="toolbar-right">
            {inboundHead.rec_mode === 'manual' && this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Popconfirm title="确定此次入库操作已完成?" onConfirm={this.handleInboundConfirmed} okText="确认" cancelText="取消">
              <Button type="primary" ghost size="large" icon="check" disabled={this.state.confirmDisabled}>
                入库确认
              </Button>
            </Popconfirm>
            }
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} dataSource={inboundProducts} rowKey="asn_seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
        <ReceivingModal reload={this.handleReload} receivingMode={inboundHead.rec_mode} />
        <ExpressReceivingModal reload={this.handleReload} asnNo={inboundHead.asn_no} inboundNo={inboundHead.inbound_no} data={this.state.selectedRows} />
      </div>
    );
  }
}
