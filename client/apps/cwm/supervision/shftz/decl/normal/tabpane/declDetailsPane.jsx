import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button, Input } from 'antd';
import { openAllocatingModal } from 'common/reducers/cwmOutbound';
import { loadWaveDetails } from 'common/reducers/cwmShippingOrder';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    waveDetails: state.cwmShippingOrder.waveDetails,
    reload: state.cwmShippingOrder.waveReload,
  }),
  { openAllocatingModal, loadWaveDetails }
)
export default class DeclDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    waveNo: PropType.string.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadWaveDetails(this.props.waveNo);
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadWaveDetails(nextProps.waveNo);
    }
  }
  columns = [{
    title: '行号',
    dataIndex: 'wave_seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 160,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '中文品名',
    dataIndex: 'name',
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
    title: '订货数量',
    dataIndex: 'order_qty',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '计量单位',
    dataIndex: 'unit_name',
    width: 80,
  }]
  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            <div className="pull-right">
              <Button type="primary" ghost shape="circle" icon="close" onClick={this.handleDeselectRows} />
            </div>
          </div>
        </div>
        <Table size="middle" columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.props.waveDetails} rowKey="wave_seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
        />
      </div>
    );
  }
}
