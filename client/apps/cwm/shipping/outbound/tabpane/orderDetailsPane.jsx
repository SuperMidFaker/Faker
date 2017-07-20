import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button, notification } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import AllocatingModal from '../modal/allocatingModal';
import QuantityInput from '../../../common/quantityInput';
import PackagePopover from '../../../common/popover/packagePopover';
import { openAllocatingModal, loadOutboundProductDetails, batchAutoAlloc, cancelProductsAlloc } from 'common/reducers/cwmOutbound';
import { CWM_OUTBOUND_STATUS } from 'common/constants';

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
    this.props.loadOutboundProductDetails(this.props.outboundNo).then((result) => {
      if (!result.error) {
        this.setState({
          selectedRowKeys: [],
        });
      }
    });
  }
  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 40,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '中文品名',
    dataIndex: 'name',
  }, {
    title: '订货数量',
    dataIndex: 'order_qty',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '计量单位',
    dataIndex: 'unit_name',
    width: 100,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 150,
    render: (o) => {
      if (o) {
        return <PackagePopover sku={o} />;
      }
    },
  }, {
    title: '分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.alloc_pack_qty} pcsQty={record.alloc_qty} />),
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.alloc_qty < record.order_qty) {
        // 订单明细的状态 0 未分配 1 部分分配 2 完全分配
        return (<span>
          <RowUpdater onHit={this.handleSKUAutoAllocate} label="自动分配" row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleManualAlloc} label="手动分配" row={record} />
        </span>);
      } else {
        return (<span>
          <RowUpdater onHit={this.handleManualAlloc} label="分配明细" row={record} />
          {record.picked_qty < record.alloc_qty && <span className="ant-divider" />}
          {record.picked_qty < record.alloc_qty &&
            <RowUpdater onHit={this.handleSKUCancelAllocate} label="取消分配" row={record} />}
        </span>);
      }
    },
  }]
  handleSKUAutoAllocate = (row) => {
    this.props.batchAutoAlloc(row.outbound_no, [row.seq_no], this.props.loginId, this.props.loginName);
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
            message: `第${seqNos}行货品数量不足`,
            duration: 0,
          };
          notification.open(args);
        }
      }
    });
  }
  handleManualAlloc = (row) => {
    this.props.openAllocatingModal({ outboundNo: row.outbound_no, outboundProduct: row });
  }
  handleSKUCancelAllocate = (row) => {
    this.props.cancelProductsAlloc(row.outbound_no, [row.seq_no], this.props.loginId);
  }
  handleAllocBatchCancel = () => {
    this.props.cancelProductsAlloc(this.props.outboundNo, this.state.selectedRowKeys, this.props.loginId);
  }
  render() {
    const { outboundHead, outboundProducts } = this.props;
    const { ButtonStatus } = this.state;
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
    };
    return (
      <div>
        <div className="toolbar">
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
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={outboundProducts} rowKey="seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
        <AllocatingModal shippingMode={this.state.shippingMode} />
      </div>
    );
  }
}
