import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import AllocatingModal from '../modal/allocatingModal';
import QuantityInput from '../../../common/quantityInput';
import { openAllocatingModal, loadOutboundProductDetails, autoAllocProduct } from 'common/reducers/cwmOutbound';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    outboundProducts: state.cwmOutbound.outboundProducts,
    reload: state.cwmOutbound.outboundReload,
  }),
  { openAllocatingModal, loadOutboundProductDetails, autoAllocProduct }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundProducts: PropType.arrayOf(PropType.shape({ seq_no: PropType.string.isRequired })),
  }
  state = {
    selectedRowKeys: [],
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
    this.props.loadOutboundProductDetails(this.props.outboundNo);
    this.setState({
      selectedRowKeys: [],
    });
  }
  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 40,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
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
    dataIndex: 'unit',
    width: 60,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} />),
  }, {
    title: '拣货数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.picked_pack_qty} pcsQty={record.picked_qty} />),
  }, {
    title: '发货数量',
    width: 200,
    render: (o, record) => (<QuantityInput packQty={record.shipped_pack_qty} pcsQty={record.shipped_qty} />),
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
          <RowUpdater onHit={this.handleSKUAllocateDetails} label="手动分配" row={record} />
        </span>);
      } else {
        return (<span>
          <RowUpdater onHit={this.handleSKUAllocateDetails} label="分配明细" row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleSKUCancelAllocate} label="取消分配" row={record} />
        </span>);
      }
    },
  }]
  handleSKUAutoAllocate = (row) => {
    this.props.autoAllocProduct(row.outbound_no, row.seq_no, this.props.loginId, this.props.loginName);
  }
  handleSKUAllocateDetails = (row) => {
    this.props.openAllocatingModal(row.outbound_no, row.seq_no);
  }
  handleWithdrawTask = () => {

  }
  render() {
    const { outboundProducts } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div>
        <div className="toolbar">
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            <Button size="large" onClick={this.handleWithdrawTask}>
              <MdIcon type="check-all" />批量自动分配
            </Button>
            <Button size="large" onClick={this.handleWithdrawTask} icon="close">
              批量取消分配
            </Button>
          </div>
          <div className="toolbar-right">
            {!this.state.allocated && <Button type="primary" size="large" onClick={this.handleAutoAllocate} >订单自动分配</Button>}
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
