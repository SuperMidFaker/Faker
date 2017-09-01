import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Tag, Icon, Input, Button } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import PickingModal from '../modal/pickingModal';
import ShippingModal from '../modal/shippingModal';
import PackagePopover from '../../../common/popover/packagePopover';
import { openPickingModal, openShippingModal, loadPickDetails, cancelPicked, loadOutboundHead, cancelTraceAlloc } from 'common/reducers/cwmOutbound';
import { CWM_OUTBOUND_STATUS } from 'common/constants';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    reload: state.cwmOutbound.outboundReload,
    pickDetails: state.cwmOutbound.pickDetails,
    outboundHead: state.cwmOutbound.outboundFormHead,
    submitting: state.cwmOutbound.submitting,
  }),
  { openPickingModal, openShippingModal, loadPickDetails, cancelPicked, loadOutboundHead, cancelTraceAlloc }
)
export default class PickingDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    outboundHead: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    currentStep: null,
    operationMode: null,
    searchValue: '',
    loading: false,
  }
  componentWillMount() {
    this.handleLoad();
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleLoad();
    }
  }
  handleLoad = () => {
    this.setState({ loading: true });
    this.props.loadPickDetails(this.props.outboundNo).then(() => {
      this.setState({ loading: false });
    });
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  columns = [{
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: (o) => {
      if (o) {
        return <PackagePopover ownerPartnerId={this.props.outboundHead.owner_partner_id} sku={o} />;
      }
    },
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
    dataIndex: 'alloc_qty',
    width: 100,
    className: 'cell-align-right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '拣货数量',
    dataIndex: 'picked_qty',
    width: 100,
    className: 'cell-align-right',
    render: (o, record) => {
      if (record.picked_qty === record.alloc_qty) {
        return (<span className="text-success">{o}</span>);
      } else if (record.picked_qty < record.alloc_qty) {
        return (<span className="text-warning">{o}</span>);
      }
    },
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 160,
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '产品序列号',
    dataIndex: 'serial_no',
    width: 100,
  }, {
    title: '分配人员',
    width: 100,
    dataIndex: 'alloc_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '分配时间',
    width: 100,
    dataIndex: 'alloc_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }, {
    title: '拣货人员',
    width: 100,
    dataIndex: 'picked_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '拣货时间',
    width: 100,
    dataIndex: 'picked_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      const { outboundHead } = this.props;
      if (outboundHead.shipping_mode === 'manual') {
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
            return (<span>
              <RowUpdater onHit={() => this.handleConfirmShipped(record.id, record.picked_qty, record.sku_pack_qty)} label="发货确认" row={record} />
              <span className="ant-divider" />
              <RowUpdater onHit={() => this.handleCancelPicked(record.id, record.picked_qty, record.picked_qty / record.sku_pack_qty)} label="取消拣货" row={record} />
            </span>);
          case 5:   // 已复核装箱
            return (<span>
              <RowUpdater onHit={() => this.handleConfirmShipped(record.id, record.picked_qty, record.sku_pack_qty)} label="发货确认" row={record} />
            </span>);
          default:
            break;
        }
      } else if (outboundHead.shipping_mode === 'scan') {
        switch (record.status) {  // 分配明细的状态 2 已分配 4 已拣货 6 已发运
          case 2:   // 已分配
            return (<span>
              <RowUpdater onHit={this.handleCancelAllocated} label="取消分配" row={record} />
            </span>);
          case 3:   // 部分拣货
            return (
              <span>
                <RowUpdater onHit={() => this.handleCancelPicked(record.id, record.picked_qty, record.picked_qty / record.sku_pack_qty)} label="取消拣货" row={record} />
              </span>
            );
          default:
            break;
        }
      }
      return '';
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
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  resetState = () => {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }
  render() {
    const { pickDetails, outboundHead, submitting } = this.props;
    const { currentStep } = this.state;
    const dataSource = pickDetails.filter((item) => {
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
        let status = null;
        const allocated = selectedRows.filter(item => item.status === CWM_OUTBOUND_STATUS.ALL_ALLOC.value);
        const picked = selectedRows.filter(item => item.status === CWM_OUTBOUND_STATUS.ALL_PICKED.value);
        if (allocated && allocated.length === selectedRows.length) {
          status = 'allAllocated';
        } else if (picked && picked.length === selectedRows.length) {
          status = 'allPicked';
        }
        this.setState({ selectedRowKeys, selectedRows, currentStep: status });
      },
      selections: [{
        key: 'all-data',
        text: '选择全部项',
        onSelect: () => {
          const selectedRowKeys = dataSource.map(item => item.id);
          this.setState({
            selectedRowKeys,  // TODO
          });
        },
      }],
    };
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            {outboundHead.shipping_mode === 'manual' && currentStep === 'allAllocated' && <Button onClick={this.handleBatchConfirmPicked}>
              <MdIcon type="check-all" />批量拣货确认
            </Button>
            }
            {currentStep === 'allAllocated' && <Button onClick={this.handleAllocBatchCancel} icon="close">
              批量取消分配
            </Button>}
            {outboundHead.shipping_mode === 'manual' && currentStep === 'allPicked' && <Button onClick={this.handleBatchConfirmShipped}>
              <MdIcon type="check-all" />批量发货确认
            </Button>}
            {outboundHead.shipping_mode === 'manual' && currentStep === 'allPicked' && <Button loading={submitting} onClick={this.handleBatchCancelPicked} icon="close">
              批量取消拣货
            </Button>}
            <div className="pull-right">
              <Button type="primary" ghost shape="circle" icon="close" onClick={this.handleDeselectRows} />
            </div>
          </div>
          <div className="toolbar-right" />
        </div>
        <Table size="middle" columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={dataSource} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
          loading={this.state.loading}
        />
        <PickingModal resetState={this.resetState} pickMode={this.state.operationMode} selectedRows={this.state.selectedRows} outboundNo={this.props.outboundNo} />
        <ShippingModal resetState={this.resetState} shipMode={this.state.operationMode} selectedRows={this.state.selectedRows} outboundNo={this.props.outboundNo} />
      </div>
    );
  }
}
