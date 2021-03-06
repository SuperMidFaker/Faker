import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { Alert, Button, notification } from 'antd';
import { CWM_OUTBOUND_STATUS, ALLOC_ERROR_MESSAGE_DESC } from 'common/constants';
import { loadSkuParams } from 'common/reducers/cwmSku';
import { openAllocatingModal, loadOutboundProductDetails, batchAutoAlloc, cancelProductsAlloc } from 'common/reducers/cwmOutbound';
import RowAction from 'client/components/RowAction';
import Summary from 'client/components/Summary';
import { MdIcon } from 'client/components/FontIcon';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { string2Bytes } from 'client/util/dataTransform';
import AllocatingModal from '../modal/allocatingModal';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    outboundHead: state.cwmOutbound.outboundFormHead,
    outboundProducts: state.cwmOutbound.outboundProducts,
    reload: state.cwmOutbound.outboundReload,
    units: state.cwmSku.params.units,
    submitting: state.cwmOutbound.submitting,
  }),
  {
    openAllocatingModal,
    loadOutboundProductDetails,
    batchAutoAlloc,
    cancelProductsAlloc,
    loadSkuParams,
  }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    // intl: intlShape.isRequired,
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
    align: 'center',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '订货数量',
    dataIndex: 'order_qty',
    width: 100,
    align: 'right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '分配数量',
    dataIndex: 'alloc_qty',
    width: 100,
    align: 'right',
    render: (o, record) => {
      if (!record.order_qty) {
        if (record.alloc_qty) {
          return (<span className="text-success">{o}</span>);
        }
        return <span />;
      }
      if (record.alloc_qty === record.order_qty) {
        return (<span className="text-success">{o}</span>);
      } else if (record.alloc_qty < record.order_qty) {
        return (<span className="text-warning">{o}</span>);
      }
      return <span />;
    },
  }, {
    title: '计量单位',
    dataIndex: 'unit',
    width: 100,
    align: 'center',
    render: (o) => {
      if (o && this.props.units.length > 0) {
        return this.props.units.find(unit => unit.code === o).name;
      }
      return <span />;
    },
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 120,
  }, {
    title: '入库单号',
    dataIndex: 'asn_cust_order_no',
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
    title: '供货商',
    dataIndex: 'supplier',
    width: 120,
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.alloc_qty < record.order_qty) {
        return (<span>
          <RowAction onClick={this.handleSKUAutoAllocate} icon="rocket" label="自动分配" row={record} disabled={this.props.submitting} />
          {record.product_no && <RowAction onClick={this.handleManualAlloc} icon="select" tooltip="手动分配" row={record} />}
        </span>);
      }
      return (<span>
        {record.product_no && <RowAction onClick={this.handleAllocDetails} icon="eye-o" label="分配明细" row={record} />}
        {record.alloc_qty === 0 && <RowAction onClick={this.handleSKUAutoAllocate} icon="rocket" label="自动分配" row={record} disabled={this.props.submitting} />}
        {record.picked_qty < record.alloc_qty &&
        <RowAction onClick={this.handleSKUCancelAllocate} icon="close-circle-o" tooltip="取消分配" row={record} disabled={this.props.submitting} />}
      </span>);
    },
  }]
  handleSKUAutoAllocate = (row) => {
    this.props.batchAutoAlloc(
      row.outbound_no,
      [row.seq_no],
      this.props.loginId,
      this.props.loginName
    ).then((result) => {
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
    this.props.batchAutoAlloc(
      this.props.outboundNo, this.state.selectedRowKeys,
      this.props.loginId, this.props.loginName
    ).then((result) => {
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
    this.props.batchAutoAlloc(this.props.outboundNo, null, this.props.loginId, this.props.loginName)
      .then((result) => {
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
    this.props.cancelProductsAlloc(row.outbound_no, [row.seq_no], this.props.loginId)
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
  handleAllocBatchCancel = () => {
    this.props.cancelProductsAlloc(
      this.props.outboundNo,
      this.state.selectedRowKeys,
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
      out['采购订单号'] = dv.po_no;
      out['批次号'] = dv.external_lot_no;
      out['产品序列号'] = dv.serial_no;
      out['供应商'] = dv.supplier;
      return out;
    });
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets.Sheet1 = XLSX.utils.json_to_sheet(csvData);
    FileSaver.saveAs(
      new window.Blob([string2Bytes(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }),
      `${outboundHead.cus_order_no || outboundHead.outbound_no}_nonallocates_${Date.now()}.xlsx`
    );
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSelRowsChange = (selectedRowKeys, selectedRows) => {
    let status = null;
    const unallocated = selectedRows.find(item =>
      (!item.alloc_qty || item.alloc_qty < item.order_qty));
    const allocated = selectedRows.find(item =>
      ((!item.order_qty && item.alloc_qty) ||
            item.alloc_qty === item.order_qty) && item.alloc_qty > item.picked_qty);
    if (unallocated && !allocated) {
      status = 'alloc';
    } else if (!unallocated && allocated) {
      status = 'unalloc';
    }
    this.setState({
      selectedRowKeys,
      ButtonStatus: status,
    });
  }
  render() {
    const { outboundHead, outboundProducts, submitting } = this.props;
    const { ButtonStatus, searchValue } = this.state;
    const dataSource = outboundProducts.filter((item) => {
      if (searchValue) {
        const reg = new RegExp(searchValue);
        return reg.test(item.product_no) || reg.test(item.serial_no);
      }
      return true;
    }).sort((pa, pb) => {
      if (!pa.order_qty && !pb.order_qty) {
        if (!pa.alloc_qty && pb.alloc_qty) {
          return -1;
        }
        if (pa.alloc_qty && !pb.alloc_qty) {
          return 1;
        }
        return pa.seq_no - pb.seq_no;
      }
      if (pa.alloc_qty === 0 && pb.alloc_qty === 0) {
        return pa.seq_no - pb.seq_no;
      }
      const diffa = pa.order_qty - pa.alloc_qty;
      const diffb = pb.order_qty - pb.alloc_qty;
      const diff = -(diffa - diffb); // 分配差异越大放前面
      if (diff === 0) {
        return pa.seq_no - pb.seq_no;
      }
      return diff;
    });
    const allocatedNum = dataSource.filter(ds => ds.alloc_qty > 0).length;
    const serialNoNum = new Set(dataSource.filter(ds => ds.serial_no)
      .map(ds => ds.serial_no)).size;
    let alertMsg;
    let partialUnAllocProducts = [];
    if (outboundHead.total_alloc_qty > 0 &&
      outboundHead.total_alloc_qty !== outboundHead.total_qty) {
      partialUnAllocProducts = outboundProducts.filter(op =>
        !op.alloc_qty || op.alloc_qty < op.order_qty);
      if (partialUnAllocProducts.length > 0) {
        const seqNos = partialUnAllocProducts.map(op => op.seq_no).join(',');
        alertMsg = <span>未完成配货行号: {seqNos}</span>;
        const noqtyPrds = partialUnAllocProducts.filter(uaprd => !uaprd.product_no);
        let allocHintMsg = null;
        if (noqtyPrds.length > 0) { // 无货号数量时无法手工分配,分配错误提示
          allocHintMsg = `检查是否${outboundHead.alloc_rules.filter(aoc => aoc.eigen).map(aoc => aoc.eigen).concat('已获取海关入库监管ID').join('或')}`;
        }
        if (allocHintMsg) {
          alertMsg = <span>未完成配货行号: {seqNos}<br />{allocHintMsg}</span>;
        }
      }
    }
    const rowKey = 'seq_no';
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleSelRowsChange,
      selections: [{
        key: 'all-data',
        text: '选择全部项',
        onSelect: () => {
          const selRows = dataSource;
          const selectedRowKeys = dataSource.map(item => item[rowKey]);
          this.handleSelRowsChange(selectedRowKeys, selRows);
        },
      }, {
        key: 'opposite-data',
        text: '反选全部项',
        onSelect: () => {
          const selRows = dataSource.filter(item =>
            !this.state.selectedRowKeys.find(item1 => item1 === item[rowKey]));
          const selectedRowKeys = selRows.map(item => item[rowKey]);
          this.handleSelRowsChange(selectedRowKeys, selRows);
        },
      }],
    };
    return (
      <DataPane
        columns={this.columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder="货号/序列号" onSearch={this.handleSearch} value={searchValue} />
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            {ButtonStatus === 'alloc' && (<Button loading={submitting} onClick={this.handleBatchAutoAlloc}>
              <MdIcon type="check-all" />批量自动分配
            </Button>)}
            {ButtonStatus === 'unalloc' && (<Button loading={submitting} onClick={this.handleAllocBatchCancel} icon="close">
              批量取消分配
            </Button>)}
          </DataPane.BulkActions>
          <DataPane.Actions>
            <span className="welo-summary">
              <Summary.Item label="分配总数">{allocatedNum}</Summary.Item>
              <Summary.Item label="序列号总数">{serialNoNum}</Summary.Item>
            </span>
            {partialUnAllocProducts.length > 0 &&
              <Button type="primary" onClick={this.handleExportUnAllocs}>导出未配货项</Button>
            }
            { outboundHead.status === CWM_OUTBOUND_STATUS.CREATED.value &&
              <Button loading={submitting} type="primary" onClick={this.handleOutboundAutoAlloc}>订单自动分配</Button>}
          </DataPane.Actions>
          {alertMsg && <Alert message={alertMsg} type="warning" showIcon />}
        </DataPane.Toolbar>
        <AllocatingModal
          shippingMode={this.state.shippingMode}
          editable={this.state.detailEditable}
        />
      </DataPane>
    );
  }
}
