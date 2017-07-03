import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Tag, Icon, Button } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { MdIcon } from 'client/components/FontIcon';
import PickingModal from '../modal/pickingModal';
import ShippingModal from '../modal/shippingModal';
import QuantityInput from '../../../common/quantityInput';
import { openPickingModal, openShippingModal, loadPickDetails } from 'common/reducers/cwmOutbound';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    reload: state.cwmOutbound.outboundReload,
    pickDetails: state.cwmOutbound.pickDetails,
  }),
  { openPickingModal, openShippingModal, loadPickDetails }
)
export default class PickingDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
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
    title: '订单行号',
    dataIndex: 'seq_no',
    width: 80,
  }, {
    title: 'SKU',
    dataIndex: 'sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '批次号',
    dataIndex: 'lot_no',
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
    render: (o, record) => (<QuantityInput packQty={record.allocated_pack_qty} pcsQty={record.allocated_qty} disabled />),
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'desc_cn',
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
    dataIndex: 'allocated_date',
    render: (o, record) => {
      if (o) {
        return (<div>
          <div><Icon type="user" />{record.allocated_by}</div>
          <div><Icon type="clock-circle-o" />{record.allocated_date}</div>
        </div>);
      }
    },
  }, {
    title: '拣货',
    width: 100,
  }, {
    title: '复核装箱',
    width: 100,
  }, {
    title: '发货',
    width: 100,
  }, {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      switch (record.status) {  // 分配明细的状态 2 已分配 4 已拣货 6 已发运
        case 2:   // 已分配
          return (<span>
            <RowUpdater onHit={this.handleConfirmPicked} label="拣货确认" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleCancelAllocated} label="取消分配" row={record} />
          </span>);
        case 4:   // 已拣货
          return (<span>
            <RowUpdater onHit={this.handleConfirmShipped} label="发货确认" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleCancelPicked} label="取消拣货" row={record} />
          </span>);
        default:
          break;
      }
    },
  }]
  handleConfirmPicked = () => {
    this.props.openPickingModal();
  }
  handleConfirmShipped = () => {
    this.props.openShippingModal();
  }
  handleBatchConfirmPicked = () => {
    this.props.openPickingModal();
  }
  handleBatchConfirmShipped = () => {
    this.props.openShippingModal();
  }
  render() {
    const { pickDetails } = this.props;
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
            <Button size="large" onClick={this.handleBatchConfirmPicked}>
              <MdIcon type="check-all" />批量拣货确认
            </Button>
            <Button size="large" onClick={this.handleWithdrawTask} icon="close">
              批量取消分配
            </Button>
            <Button size="large" onClick={this.handleBatchConfirmShipped}>
              <MdIcon type="check-all" />批量发货确认
            </Button>
            <Button size="large" onClick={this.handleWithdrawTask} icon="close">
              批量取消拣货
            </Button>
          </div>
          <div className="toolbar-right" />
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={pickDetails} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
        <PickingModal shippingMode={this.state.shippingMode} />
        <ShippingModal shippingMode={this.state.shippingMode} />
      </div>
    );
  }
}
