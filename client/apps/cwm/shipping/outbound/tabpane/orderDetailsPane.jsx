import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { Alert, Input, Button, notification } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import DataPane from 'client/components/DataPane';
import AllocatingModal from '../modal/allocatingModal';
import { loadSkuParams } from 'common/reducers/cwmSku';
import { openAllocatingModal, loadOutboundProductDetails, batchAutoAlloc, cancelProductsAlloc } from 'common/reducers/cwmOutbound';
import { string2Bytes } from 'client/util/dataTransform';
import { CWM_OUTBOUND_STATUS } from 'common/constants';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    outboundHead: state.cwmOutbound.outboundFormHead,
    outboundProducts: state.cwmOutbound.outboundProducts,
    reload: state.cwmOutbound.outboundReload,
    units: state.cwmSku.params.units,
    submitting: state.cwmOutbound.submitting,
  }),
  { openAllocatingModal, loadOutboundProductDetails, batchAutoAlloc, cancelProductsAlloc, loadSkuParams }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundProducts: PropType.arrayOf(PropType.shape({ seq_no: PropType.string.isRequired })),
  }
  state = {
    selectedRowKeys: [],
    ButtonStatus: null,
    detailEditable: false,
    searchValue: '',
    loading: false,
  }
  componentWillMount() {
    this.handleReload();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleReload();
    }
    if (nextProps.outboundHead !== this.props.outboundHead) {
      this.props.loadSkuParams(nextProps.outboundHead.owner_partner_id);
    }
  }
  handleReload = () => {
    this.setState({ loading: true });
    this.props.loadOutboundProductDetails(this.props.outboundNo).then((result) => {
      if (!result.error) {
        this.setState({
          selectedRowKeys: [],
          loading: false,
        });
      }
    });
  }
  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 50,
    className: 'cell-align-center',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: '中文品名',
    dataIndex: 'name',
  }, {
    title: '订货数量',
    dataIndex: 'order_qty',
    width: 100,
    className: 'cell-align-right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '分配数量',
    dataIndex: 'alloc_qty',
    width: 100,
    className: 'cell-align-right',
    render: (o, record) => {
      if (record.alloc_qty === record.order_qty) {
        return (<span className="text-success">{o}</span>);
      } else if (record.alloc_qty < record.order_qty) {
        return (<span className="text-warning">{o}</span>);
      }
    },
  }, {
    title: '计量单位',
    dataIndex: 'unit',
    width: 100,
    className: 'cell-align-center',
    render: o => this.props.units.length > 0 && o ? this.props.units.find(unit => unit.code === o).name : '',
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 120,
  }, {
    title: '入库单号',
    dataIndex: 'po_no',
    width: 120,
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 120,
  }, {
    title: '产品序列号',
    dataIndex: 'serial_no',
    width: 120,
  }, {
    title: '供应商',
    dataIndex: 'supplier',
    width: 120,
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.alloc_qty < record.order_qty) {
        return (<span>
          <RowUpdater onHit={this.handleSKUAutoAllocate} label="自动分配" row={record} disabled={this.props.submitting} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleManualAlloc} label="手动分配" row={record} />
        </span>);
      } else {
        return (<span>
          <RowUpdater onHit={this.handleAllocDetails} label="分配明细" row={record} />
          {record.picked_qty < record.alloc_qty && <span className="ant-divider" />}
          {record.picked_qty < record.alloc_qty &&
            <RowUpdater onHit={this.handleSKUCancelAllocate} label="取消分配" row={record} disabled={this.props.submitting} />}
        </span>);
      }
    },
  }]
  handleSKUAutoAllocate = (row) => {
    this.props.batchAutoAlloc(row.outbound_no, [row.seq_no], this.props.loginId, this.props.loginName).then((result) => {
      if (!result.error) {
        if (result.data.length > 0) {
          const seqNos = result.data.join(',');
          const args = {
            message: `行号${seqNos}货品数量不足`,
            duration: 0,
          };
          notification.open(args);
        }
      } else {
        notification.error({
          message: result.error.message,
        });
      }
    });
  }
  handleBatchAutoAlloc = () => {
    this.props.batchAutoAlloc(this.props.outboundNo, this.state.selectedRowKeys,
      this.props.loginId, this.props.loginName).then((result) => {
        if (!result.error) {
          if (result.data.length > 0) {
            const seqNos = result.data.join(',');
            const args = {
              message: `行号${seqNos}货品数量不足`,
              duration: 0,
            };
            notification.open(args);
          }
        } else {
          notification.error({
            message: result.error.message,
          });
        }
      });
  }
  handleOutboundAutoAlloc = () => {
    this.props.batchAutoAlloc(this.props.outboundNo, null, this.props.loginId, this.props.loginName).then((result) => {
      if (!result.error) {
        if (result.data.length > 0) {
          const seqNos = result.data.join(',');
          const args = {
            message: `行号${seqNos}货品数量不足`,
            duration: 0,
          };
          notification.open(args);
        }
      } else {
        notification.error({
          message: result.error.message,
        });
      }
    });
  }
  handleManualAlloc = (row) => {
    this.setState({ detailEditable: true });
    this.props.openAllocatingModal({ outboundNo: row.outbound_no, outboundProduct: row });
  }
  handleAllocDetails = (row) => {
    this.setState({ detailEditable: false });
    this.props.openAllocatingModal({ outboundNo: row.outbound_no, outboundProduct: row });
  }
  handleSKUCancelAllocate = (row) => {
    this.props.cancelProductsAlloc(row.outbound_no, [row.seq_no], this.props.loginId).then((result) => {
      if (result.error) {
        notification.error({
          message: result.error.message,
        });
      }
    });
  }
  handleAllocBatchCancel = () => {
    this.props.cancelProductsAlloc(this.props.outboundNo, this.state.selectedRowKeys, this.props.loginId).then((result) => {
      if (result.error) {
        notification.error({
          message: result.error.message,
        });
      }
    });
  }
  handleExportUnAllocs = () => {
    const { outboundHead, outboundProducts, units } = this.props;
    const csvData = outboundProducts.filter(dv => dv.alloc_qty < dv.order_qty).map((dv) => {
      const out = {};
      out['订单号'] = outboundHead.cust_order_no;
      out['货号'] = dv.product_no;
      out['名称'] = dv.name;
      out['订货数量'] = dv.order_qty;
      out['分配数量'] = dv.alloc_qty;
      out['计量单位'] = units.length > 0 && dv.unit ? units.find(unit => unit.code === dv.unit).name : '';
      out['库别'] = dv.virtual_whse;
      out['入库单号'] = dv.po_no;
      out['批次号'] = dv.external_lot_no;
      out['产品序列号'] = dv.serial_no;
      out['供应商'] = dv.supplier;
      return out;
    });
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets.Sheet1 = XLSX.utils.json_to_sheet(csvData);
    FileSaver.saveAs(new window.Blob([string2Bytes(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }),
      `${outboundHead.cus_order_no || outboundHead.outbound_no}_nonallocates_${Date.now()}.xlsx`);
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { outboundHead, outboundProducts, submitting } = this.props;
    const { ButtonStatus } = this.state;
    const dataSource = outboundProducts.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      } else {
        return true;
      }
    }).sort((pa, pb) => {
      if (pa.alloc_qty === 0 && pb.alloc_qty === 0) {
        return 0;
      }
      const diffa = pa.order_qty - pa.alloc_qty;
      const diffb = pb.order_qty - pb.alloc_qty;
      return -(diffa - diffb); // 分配差异越大放前面
    });
    let alertMsg;
    if (outboundHead.total_alloc_qty > 0 && outboundHead.total_alloc_qty !== outboundHead.total_qty) {
      const seqNos = outboundProducts.filter(op => op.alloc_qty < op.order_qty).map(op => op.seq_no).join(',');
      alertMsg = `未完成配货行号: ${seqNos}`;
    }
    const rowKey = 'seq_no';
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        let status = null;
        const unallocated = selectedRows.find(item => item.alloc_qty < item.order_qty);
        const allocated = selectedRows.find(item => item.alloc_qty === item.order_qty && item.alloc_qty > item.picked_qty);
        if (unallocated && !allocated) {
          status = 'alloc';
        } else if (!unallocated && allocated) {
          status = 'unalloc';
        }
        this.setState({
          selectedRowKeys,
          ButtonStatus: status,
        });
      },
      selections: [{
        key: 'all-data',
        text: '选择全部项',
        onSelect: () => {
          const selectedRowKeys = dataSource.map(item => item[rowKey]);
          let status = null;
          const unallocated = dataSource.find(item => item.alloc_qty < item.order_qty);
          const allocated = dataSource.find(item => item.alloc_qty === item.order_qty && item.alloc_qty > item.picked_qty);
          if (unallocated && !allocated) {
            status = 'alloc';
          } else if (!unallocated && allocated) {
            status = 'unalloc';
          }
          this.setState({
            selectedRowKeys,
            ButtonStatus: status,
          });
        },
      }, {
        key: 'opposite-data',
        text: '反选全部项',
        onSelect: () => {
          const fDataSource = dataSource.filter(item => !this.state.selectedRowKeys.find(item1 => item1 === item.id));
          const selectedRowKeys = fDataSource.map(item => item.id);
          let status = null;
          const unallocated = fDataSource.find(item => item.alloc_qty < item.order_qty);
          const allocated = fDataSource.find(item => item.alloc_qty === item.order_qty && item.alloc_qty > item.picked_qty);
          if (unallocated && !allocated) {
            status = 'alloc';
          } else if (!unallocated && allocated) {
            status = 'unalloc';
          }
          this.setState({
            selectedRowKeys,
            ButtonStatus: status,
          });
        },
      }],
    };
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={this.columns} rowSelection={rowSelection} indentSize={0}
        dataSource={dataSource} rowKey={rowKey} loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          {alertMsg && <Alert message={alertMsg} type="warning" showIcon />}
          <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
            {ButtonStatus === 'alloc' && (<Button loading={submitting} onClick={this.handleBatchAutoAlloc}>
              <MdIcon type="check-all" />批量自动分配
            </Button>)}
            {ButtonStatus === 'unalloc' && (<Button loading={submitting} onClick={this.handleAllocBatchCancel} icon="close">
              批量取消分配
            </Button>)}
          </DataPane.BulkActions>
          <DataPane.Actions>
            {outboundHead.total_alloc_qty > 0 && outboundHead.total_alloc_qty < outboundHead.total_qty &&
              <Button type="primary" onClick={this.handleExportUnAllocs}>导出未配货项</Button>
            }
            { outboundHead.status === CWM_OUTBOUND_STATUS.CREATED.value &&
              <Button loading={submitting} type="primary" onClick={this.handleOutboundAutoAlloc}>订单自动分配</Button>}
          </DataPane.Actions>
        </DataPane.Toolbar>
        <AllocatingModal shippingMode={this.state.shippingMode} editable={this.state.detailEditable} />
      </DataPane>
    );
  }
}
