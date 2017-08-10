import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Input, Button, notification } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import AllocatingModal from '../modal/allocatingModal';
import PackagePopover from '../../../common/popover/packagePopover';
import { openAllocatingModal, loadOutboundProductDetails, batchAutoAlloc, cancelProductsAlloc } from 'common/reducers/cwmOutbound';
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
  }),
  { openAllocatingModal, loadOutboundProductDetails, batchAutoAlloc, cancelProductsAlloc }
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
    cancelAllocDisabled: false,
    autoAllocDisabled: false,
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
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 120,
  }, {
    title: '入库单号',
    dataIndex: 'inbound_no',
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
    dataIndex: 'unit_name',
    width: 100,
    className: 'cell-align-center',
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: (o) => {
      if (o) {
        return <PackagePopover sku={o} />;
      }
    },
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.alloc_qty < record.order_qty) {
        return (<span>
          <RowUpdater onHit={this.handleSKUAutoAllocate} label="自动分配" row={record} disabled={this.state.autoAllocDisabled} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleManualAlloc} label="手动分配" row={record} />
        </span>);
      } else {
        return (<span>
          <RowUpdater onHit={this.handleAllocDetails} label="分配明细" row={record} />
          {record.picked_qty < record.alloc_qty && <span className="ant-divider" />}
          {record.picked_qty < record.alloc_qty &&
            <RowUpdater onHit={this.handleSKUCancelAllocate} label="取消分配" row={record} disabled={this.state.cancelAllocDisabled} />}
        </span>);
      }
    },
  }]
  handleSKUAutoAllocate = (row) => {
    this.setState({ autoAllocDisabled: true });
    this.props.batchAutoAlloc(row.outbound_no, [row.seq_no], this.props.loginId, this.props.loginName).then((result) => {
      this.setState({ autoAllocDisabled: false });
      if (result.error) {
        notification.error({
          message: result.error.message,
        });
      }
    });
  }
  handleBatchAutoAlloc = () => {
    this.props.batchAutoAlloc(this.props.outboundNo, this.state.selectedRowKeys,
      this.props.loginId, this.props.loginName);
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
    this.setState({ cancelAllocDisabled: true });
    this.props.cancelProductsAlloc(row.outbound_no, [row.seq_no], this.props.loginId).then((result) => {
      this.setState({ cancelAllocDisabled: false });
      if (result.error) {
        notification.error({
          message: result.error.message,
        });
      }
    });
  }
  handleAllocBatchCancel = () => {
    this.props.cancelProductsAlloc(this.props.outboundNo, this.state.selectedRowKeys, this.props.loginId);
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  render() {
    const { outboundHead, outboundProducts } = this.props;
    const { ButtonStatus } = this.state;
    const dataSource = outboundProducts.filter((item) => {
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
          const selectedRowKeys = dataSource.map(item => item.seq_no);
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
            {ButtonStatus === 'alloc' && (<Button size="large" onClick={this.handleBatchAutoAlloc}>
              <MdIcon type="check-all" />批量自动分配
            </Button>)}
            {ButtonStatus === 'unalloc' && (<Button size="large" onClick={this.handleAllocBatchCancel} icon="close">
              批量取消分配
            </Button>)}
          </div>
          <div className="toolbar-right">
            { outboundHead.status === CWM_OUTBOUND_STATUS.CREATED.value &&
              <Button type="primary" size="large" onClick={this.handleOutboundAutoAlloc}>订单自动分配</Button>}
          </div>
        </div>
        <Table size="middle" columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={dataSource} rowKey="seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
          loading={this.state.loading}
        />
        <AllocatingModal shippingMode={this.state.shippingMode} editable={this.state.detailEditable} />
      </div>
    );
  }
}
