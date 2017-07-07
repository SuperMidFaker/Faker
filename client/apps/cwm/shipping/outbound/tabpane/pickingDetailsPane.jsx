import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Tag, Icon, Button } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import PickingModal from '../modal/pickingModal';
import ShippingModal from '../modal/shippingModal';
import QuantityInput from '../../../common/quantityInput';
import { openPickingModal, openShippingModal, loadPickDetails, cancelPicked, loadOutboundHead, cancelTraceAlloc } from 'common/reducers/cwmOutbound';
import { CWM_OUTBOUND_STATUS } from 'common/constants';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    reload: state.cwmOutbound.outboundReload,
    pickDetails: state.cwmOutbound.pickDetails,
  }),
  { openPickingModal, openShippingModal, loadPickDetails, cancelPicked, loadOutboundHead, cancelTraceAlloc }
)
export default class PickingDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    ButtonStatus: null,
    operationMode: null,
  }
  componentWillMount() {
    this.props.loadPickDetails(this.props.outboundNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadPickDetails(this.props.outboundNo);
    }
  }
  columns = [{
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
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
    title: '分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.alloc_qty / record.sku_pack_qty} pcsQty={record.alloc_qty} disabled />),
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,

  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '分配',
    width: 100,
    dataIndex: 'alloc_date',
    render: (o, record) => {
      if (o) {
        return (<div>
          <div><Icon type="user" />{record.alloc_by}</div>
          <div><Icon type="clock-circle-o" />{moment(record.alloc_date).format('YYYY.MM.DD')}</div>
        </div>);
      }
    },
  }, {
    title: '拣货',
    width: 100,
    dataIndex: 'picked_date',
    render: (o, record) => {
      if (o) {
        return (<div>
          <div><Icon type="user" />{record.picked_by}</div>
          <div><Icon type="clock-circle-o" />{moment(record.picked_date).format('YYYY.MM.DD')}</div>
        </div>);
      }
    },
  }, {
    title: '复核装箱',
    width: 100,
    dataIndex: 'chkpacked_date',
    render: (o, record) => {
      if (o) {
        return (<div>
          <div><Icon type="user" />{record.chkpacked_by}</div>
          <div><Icon type="clock-circle-o" />{moment(record.chkpacked_date).format('YYYY.MM.DD')}</div>
        </div>);
      }
    },
  }, {
    title: '发货',
    width: 100,
    dataIndex: 'shipped_date',
    render: (o, record) => {
      if (o) {
        return (<div>
          <div><Icon type="user" />{record.shipped_by}</div>
          <div><Icon type="clock-circle-o" />{moment(record.shipped_date).format('YYYY.MM.DD')}</div>
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
            <RowUpdater onHit={() => this.handleConfirmPicked(record.id, record.location, record.alloc_qty, record.sku_pack_qty, record.trace_id)} label="拣货确认" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleCancelAllocated} label="取消分配" row={record} />
          </span>);
        case 3:   // 部分拣货
          return (
            <span>
              <RowUpdater onHit={() => this.handleConfirmPicked(record.id, record.location, record.alloc_qty, record.sku_pack_qty, record.trace_id)} label="拣货确认" row={record} />
              <span className="ant-divider" />
              <RowUpdater onHit={() => this.handleCancelPicked(record.id, record.picked_qty, record.picked_qty / record.sku_pack_qty)} label="取消拣货" row={record} />
            </span>
          );
        case 4:   // 已拣货
        case 5:   // 已复核装箱
          return (<span>
            <RowUpdater onHit={() => this.handleConfirmShipped(record.id, record.picked_qty, record.sku_pack_qty)} label="发货确认" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={() => this.handleCancelPicked(record.id, record.picked_qty, record.picked_qty / record.sku_pack_qty)} label="取消拣货" row={record} />
          </span>);
        default:
          break;
      }
    },
  }]
  handleCancelAllocated = (row) => {
    this.props.cancelTraceAlloc(row.outbound_no, [row.id], this.props.loginId).then((result) => {
      if (!result.error) {
        this.resetState();
      }
    });
  }
  handleCancelPicked = (id, pickedQty, pickedPackQty) => {
    const data = {
      id,
      picked_qty: pickedQty,
      picked_pack_qty: pickedPackQty,
    };
    this.props.cancelPicked(this.props.outboundNo, [data]);
  }
  handleConfirmPicked = (id, location, allocQty, skuPackQty, traceId) => {
    this.props.openPickingModal(id, location, allocQty, skuPackQty, traceId);
    this.setState({
      operationMode: 'single',
    });
  }
  handleConfirmShipped = (id, pickedQty, pickedPackQty) => {
    this.props.openShippingModal(id, pickedQty, pickedPackQty);
    this.setState({
      operationMode: 'single',
    });
  }
  handleBatchConfirmPicked = () => {
    this.props.openPickingModal();
    this.setState({
      operationMode: 'batch',
    });
  }
  handleBatchConfirmShipped = () => {
    this.props.openShippingModal();
    this.setState({
      operationMode: 'batch',
    });
  }
  handleBatchCancelPicked = () => {
    const { selectedRows } = this.state;
    const list = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const data = {};
      data.id = selectedRows[i].id;
      data.picked_qty = selectedRows[i].picked_qty;
      data.picked_pack_qty = selectedRows[i].picked_qty / selectedRows[i].sku_pack_qty;
      list.push(data);
    }
    this.props.cancelPicked(this.props.outboundNo, list).then((result) => {
      if (!result.error) {
        this.resetState();
      }
    });
  }
  handleAllocBatchCancel = () => {
    this.props.cancelTraceAlloc(this.props.outboundNo, this.state.selectedRowKeys, this.props.loginId).then((result) => {
      if (!result.error) {
        this.resetState();
      }
    });
  }
  resetState = () => {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }
  render() {
    const { pickDetails } = this.props;
    const { ButtonStatus } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        let status = null;
        const allocated = selectedRows.filter(item => item.status === CWM_OUTBOUND_STATUS.ALL_ALLOC.value);
        const picked = selectedRows.filter(item => item.status === CWM_OUTBOUND_STATUS.ALL_PICKED.value);
        if (allocated && allocated.length === selectedRows.length) {
          status = 'allAllocated';
        } else if (picked && picked.length === selectedRows.length) {
          status = 'allPicked';
        }
        this.setState({ selectedRowKeys, selectedRows, ButtonStatus: status });
      },
    };
    return (
      <div>
        <div className="toolbar">
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            {ButtonStatus === 'allAllocated' && <span><Button size="large" onClick={this.handleBatchConfirmPicked}>
              <MdIcon type="check-all" />批量拣货确认
            </Button>
              <Button size="large" onClick={this.handleAllocBatchCancel} icon="close">
              批量取消分配
            </Button></span>}
            {ButtonStatus === 'allPicked' && <span><Button size="large" onClick={this.handleBatchConfirmShipped}>
              <MdIcon type="check-all" />批量发货确认
            </Button>
              <Button size="large" onClick={this.handleBatchCancelPicked} icon="close">
              批量取消拣货
            </Button></span>}
          </div>
          <div className="toolbar-right" />
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={pickDetails} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
        <PickingModal resetState={this.resetState} pickMode={this.state.operationMode} selectedRows={this.state.selectedRows} outboundNo={this.props.outboundNo} />
        <ShippingModal resetState={this.resetState} shipMode={this.state.operationMode} selectedRows={this.state.selectedRows} outboundNo={this.props.outboundNo} />
      </div>
    );
  }
}
