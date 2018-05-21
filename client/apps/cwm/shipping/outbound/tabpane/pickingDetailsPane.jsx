import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Tag, Icon, Button, notification } from 'antd';
import RowAction from 'client/components/RowAction';
import { MdIcon } from 'client/components/FontIcon';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { openPickingModal, openShippingModal, loadPickDetails, cancelPicked, loadOutboundHead, showSubarPickChkModal, cancelTraceAlloc } from 'common/reducers/cwmOutbound';
import { CWM_SO_TYPES, CWM_OUTBOUND_STATUS, ALLOC_ERROR_MESSAGE_DESC } from 'common/constants';
import PickingModal from '../modal/pickingModal';
import ShippingModal from '../modal/shippingModal';
import SuBarPickChkpackModal from '../modal/suBarPickChkpackModal';
import SKUPopover from '../../../common/popover/skuPopover';
import TraceIdPopover from '../../../common/popover/traceIdPopover';
import { formatMsg } from '../../message.i18n';

function calcPickSortSort(det) {
  if (det.picked_qty > 0) {
    if (det.picked_qty !== det.alloc_qty) {
      return 3;
    }
    return 1;
  }
  return 2;
}


@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    reload: state.cwmOutbound.outboundReload,
    pickDetails: state.cwmOutbound.pickDetails,
    outboundHead: state.cwmOutbound.outboundFormHead,
    submitting: state.cwmOutbound.submitting,
  }),
  {
    openPickingModal,
    openShippingModal,
    loadPickDetails,
    cancelPicked,
    loadOutboundHead,
    cancelTraceAlloc,
    showSubarPickChkModal,
  }
)
export default class PickingDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    outboundHead: PropTypes.shape({
      shipping_mode: PropTypes.string,
      owner_partner_id: PropTypes.number.isRequired,
    }).isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    currentStep: null,
    batchPickedUnShipped: false,
    operationMode: null,
    searchValue: '',
    loading: false,
  }
  componentWillMount() {
    this.handleLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleLoad();
      this.handleDeselectRows();
    }
  }
  msg = formatMsg(this.props.intl)
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
    title: '行号',
    dataIndex: 'seq_no',
    width: 50,
    align: 'center',
  }, {
    title: '商品货号',
    dataIndex: 'product_sku',
    width: 200,
    render: o => o &&
    <SKUPopover ownerPartnerId={this.props.outboundHead.owner_partner_id} sku={o} />,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: o => o && <Tag>{o}</Tag>,
  }, {
    title: '分配数量',
    dataIndex: 'alloc_qty',
    width: 100,
    align: 'right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '拣货数量',
    dataIndex: 'picked_qty',
    width: 100,
    align: 'right',
    render: (o, record) => {
      if (record.picked_qty === record.alloc_qty) {
        return (<span className="text-success">{o}</span>);
      } else if (record.picked_qty < record.alloc_qty) {
        return (<span className="text-warning">{o}</span>);
      }
      return null;
    },
  }, {
    title: '发货数量',
    dataIndex: 'shipped_qty',
    width: 100,
    align: 'right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 180,
    render: o => o && <TraceIdPopover traceId={o} />,
  }, {
    title: '货物属性',
    dataIndex: 'bonded',
    width: 80,
    align: 'center',
    render: bonded => (bonded ? <Tag color="blue">保税</Tag> : <Tag>非保税</Tag>),
  }, {
    title: '分拨货物',
    dataIndex: 'portion',
    width: 80,
    align: 'center',
    render: portion => (portion ? <Tag color="green">可分拨</Tag> : <Tag>否</Tag>),
  }, {
    title: '库别',
    width: 100,
    dataIndex: 'virtual_whse',
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 120,
  }, {
    title: '序列号',
    dataIndex: 'serial_no',
    width: 100,
  }, {
    title: '分配人员',
    width: 100,
    dataIndex: 'alloc_by',
    render: o => (o && <div><Icon type="user" />{o}</div>),
  }, {
    title: '分配时间',
    width: 100,
    dataIndex: 'alloc_date',
    render: o => (o && <div>{moment(o).format('MM.DD HH:mm')}</div>),
  }, {
    title: '拣货人员',
    width: 100,
    dataIndex: 'picked_by',
    render: o => (o && <div><Icon type="user" />{o}</div>),
  }, {
    title: '拣货时间',
    width: 100,
    dataIndex: 'picked_date',
    render: o => (o && <div>{moment(o).format('MM.DD HH:mm')}</div>),
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      const { outboundHead, submitting } = this.props;
      if (outboundHead.shipping_mode === 'manual') {
        switch (record.status) { // 分配明细的状态 2 已分配 4 已拣货 6 已发运
          case 2: // 已分配
            return (<span>
              {outboundHead.so_type !== CWM_SO_TYPES[3].value &&
              <RowAction onClick={() => this.handleConfirmPicked(record.id, record.location, record.alloc_qty, record.sku_pack_qty, record.trace_id)} icon="check-circle-o" label="拣货确认" row={record} />
}
              <RowAction onClick={this.handleCancelAllocated} icon="close-circle-o" tooltip="取消分配" row={record} disabled={submitting} />
            </span>);
          case 3: // 部分拣货
            return (
              <span>
                <RowAction onClick={() => this.handleConfirmPicked(record.id, record.location, record.alloc_qty - record.picked_qty, record.sku_pack_qty, record.trace_id)} icon="check-circle-o" label="拣货确认" row={record} />
                {record.picked_qty > record.shipped_qty &&
                <RowAction onClick={() => this.handleConfirmShipped(record.id, record.picked_qty - record.shipped_qty, record.sku_pack_qty)} icon="check-circle-o" label="拣货部分发货确认" row={record} />}
                <RowAction onClick={() => this.handleCancelPicked(record.id, record.picked_qty, record.picked_qty / record.sku_pack_qty)} icon="close-circle-o" tooltip="取消拣货" row={record} disabled={submitting} />
              </span>
            );
          case 4: // 已拣货
            return (<span>
              {record.picked_qty < record.alloc_qty &&
                <RowAction onClick={() => this.handleConfirmPicked(record.id, record.location, record.alloc_qty - record.picked_qty, record.sku_pack_qty, record.trace_id)} icon="check-circle-o" label="拣货确认" row={record} />}
              <RowAction onClick={() => this.handleConfirmShipped(record.id, record.picked_qty - record.shipped_qty, record.sku_pack_qty)} icon="check-circle-o" label="发货确认" row={record} />
              <RowAction onClick={() => this.handleCancelPicked(record.id, record.picked_qty, record.picked_qty / record.sku_pack_qty)} icon="close-circle-o" tooltip="取消拣货" row={record} disabled={submitting} />
            </span>);
          case 5: // 已复核装箱
            return (<span>
              <RowAction onClick={() => this.handleConfirmShipped(record.id, record.picked_qty, record.sku_pack_qty)} icon="check-circle-o" label="发货确认" row={record} />
            </span>);
          default:
            return (record.picked_qty < record.alloc_qty ?
              <RowAction onClick={() => this.handleConfirmPicked(record.id, record.location, record.alloc_qty - record.picked_qty, record.sku_pack_qty, record.trace_id)} icon="check-circle-o" label="拣货确认" row={record} /> : null);
        }
      } else if (outboundHead.shipping_mode === 'scan') {
        switch (record.status) { // 分配明细的状态 2 已分配 4 已拣货 6 已发运
          case 2: // 已分配
            return (<span>
              <RowAction onClick={this.handleCancelAllocated} label="取消分配" row={record} disabled={submitting} />
            </span>);
          case 3: // 部分拣货
            return (
              <span>
                <RowAction onClick={() => this.handleCancelPicked(record.id, record.picked_qty, record.picked_qty / record.sku_pack_qty)} icon="close-circle-o" tooltip="取消拣货" disabled={submitting} row={record} />
              </span>
            );
          default:
            break;
        }
      }
      return null;
    },
  }]
  handleCancelAllocated = (row) => {
    this.props.cancelTraceAlloc(row.outbound_no, [row.id], this.props.loginId)
      .then((result) => {
        if (result.error) {
          let msg = result.error.message;
          if (ALLOC_ERROR_MESSAGE_DESC[result.error.message]) {
            msg = ALLOC_ERROR_MESSAGE_DESC[result.error.message];
          }
          notification.error({
            message: msg,
          });
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
    this.props.cancelPicked(this.props.outboundNo, list);
  }
  handleAllocBatchCancel = () => {
    this.props.cancelTraceAlloc(
      this.props.outboundNo, this.state.selectedRowKeys,
      this.props.loginId
    ).then((result) => {
      if (result.error) {
        let msg = result.error.message;
        if (ALLOC_ERROR_MESSAGE_DESC[result.error.message]) {
          msg = ALLOC_ERROR_MESSAGE_DESC[result.error.message];
        }
        notification.error({
          message: msg,
        });
      }
    });
  }
  handleSuPickChk = () => {
    this.props.showSubarPickChkModal({ visible: true });
  }
  handleDeselectRows = () => {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }
  handleSelectRowsChange = (selectedRowKeys, selectedRows) => {
    let status = null;
    const allocated = selectedRows.filter(item => item.status ===
      CWM_OUTBOUND_STATUS.ALL_ALLOC.value);
    const picked = selectedRows.filter(item => item.status ===
      CWM_OUTBOUND_STATUS.ALL_PICKED.value);
    if (allocated && allocated.length === selectedRows.length) {
      status = 'allAllocated';
    } else if (picked && picked.length === selectedRows.length) {
      status = 'allPicked';
    }
    const batchPickedUnShipped = selectedRows.filter(item => item.picked_qty > 0
      && item.picked_qty > item.shipped_qty).length > 0;
    this.setState({
      selectedRowKeys, selectedRows, currentStep: status, batchPickedUnShipped,
    });
  }
  render() {
    const { pickDetails, outboundHead, submitting } = this.props;
    const { currentStep, batchPickedUnShipped } = this.state;
    const dataSource = pickDetails.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      }
      return true;
    }).sort((pa, pb) => {
      const paScore = calcPickSortSort(pa);
      const pbScore = calcPickSortSort(pb);
      if (paScore === pbScore) {
        return pa.id - pb.id;
      }
      return -(paScore - pbScore);
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleSelectRowsChange,
      selections: [{
        key: 'all-data',
        text: '选择全部项',
        onSelect: () => {
          const selectedRowKeys = dataSource.map(item => item.id);
          this.handleSelectRowsChange(selectedRowKeys, dataSource);
        },
      }, {
        key: 'opposite-data',
        text: '反选全部项',
        onSelect: () => {
          const fDataSource = dataSource.filter(item => !this.state.selectedRowKeys.find(item1 =>
            item1 === item.id));
          const selectedRowKeys = fDataSource.map(item => item.id);
          this.handleSelectRowsChange(selectedRowKeys, fDataSource);
        },
      }],
    };
    return (
      <DataPane
        columns={this.columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={dataSource}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder="货号/SKU" onSearch={this.handleSearch} />
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            {outboundHead.shipping_mode === 'manual'
                && outboundHead.so_type !== CWM_SO_TYPES[3].value
                && currentStep === 'allAllocated' && <Button onClick={this.handleBatchConfirmPicked}>
                  <MdIcon type="check-all" />批量拣货确认
                </Button>
            }
            {currentStep === 'allAllocated' && <Button onClick={this.handleAllocBatchCancel} icon="close" loading={submitting}>
              批量取消分配
            </Button>}
            {outboundHead.shipping_mode === 'manual'
            && outboundHead.so_type !== CWM_SO_TYPES[3].value
            && batchPickedUnShipped && <Button onClick={this.handleBatchConfirmShipped}>
              <MdIcon type="check-all" />批量发货确认
            </Button>}
            {outboundHead.shipping_mode === 'manual'
            && outboundHead.so_type !== CWM_SO_TYPES[3].value
            && currentStep === 'allPicked' && <Button loading={submitting} onClick={this.handleBatchCancelPicked} icon="close">
              批量取消拣货
            </Button>}
          </DataPane.BulkActions>
          <DataPane.Actions>
            {outboundHead.shipping_mode === 'manual' && outboundHead.su_setting.enabled &&
            <Button onClick={this.handleSuPickChk} loading={this.state.loading}>
            条码拣货装箱
            </Button>}
          </DataPane.Actions>
        </DataPane.Toolbar>
        <PickingModal
          pickMode={this.state.operationMode}
          selectedRows={this.state.selectedRows}
          outboundNo={this.props.outboundNo}
        />
        <ShippingModal
          shipMode={this.state.operationMode}
          selectedRows={this.state.selectedRows}
          outboundNo={this.props.outboundNo}
        />
        <SuBarPickChkpackModal
          outboundNo={this.props.outboundNo}
          suSetting={outboundHead.su_setting}
        />
      </DataPane>
    );
  }
}
