import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button, Input } from 'antd';
import { loadWaveOrders, removeWaveOrders, loadWaveHead, loadWaveDetails } from 'common/reducers/cwmShippingOrder';
import { CWM_SO_TYPES } from 'common/constants';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    waveOrders: state.cwmShippingOrder.waveOrders,
    reload: state.cwmShippingOrder.waveReload,
  }),
  { loadWaveOrders, removeWaveOrders, loadWaveHead, loadWaveDetails }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadWaveOrders(this.props.waveNo);
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadWaveOrders(nextProps.waveNo);
    }
  }
  columns = [{
    title: '行号',
    width: 50,
    render: (o, record, index) => index + 1,
  }, {
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 180,
  }, {
    title: '订单类型',
    dataIndex: 'so_type',
    render: o => CWM_SO_TYPES[o - 1].text,
  }, {
    title: '状态',
    dataIndex: 'status',
  }, {
    title: '货主',
    dataIndex: 'owner_name',
    width: 150,
  }, {
    title: '收货人',
    dataIndex: 'receiver_name',
    width: 150,
    render: o => (<b>{o}</b>),
  }, {
    title: '承运人',
    dataIndex: 'carrier_name',
    width: 150,
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 150,
    render: o => moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '要求出货日期',
    dataIndex: 'expect_shipping_date',
    width: 120,
    render: o => moment(o).format('YYYY.MM.DD'),
  }]
  handleRemoveOrders = () => {
    this.props.removeWaveOrders(this.state.selectedRowKeys, this.props.waveNo).then((result) => {
      if (!result.error) {
        this.setState({ selectedRowKeys: [] });
      }
    });
  }
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
          <Search placeholder="SO编号" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            <Button size="large" onClick={this.handleRemoveOrders} icon="close">
              移除订单
            </Button>
            <div className="pull-right">
              <Button type="primary" ghost shape="circle" icon="close" onClick={this.handleDeselectRows} />
            </div>
          </div>
          <div className="toolbar-right" />
        </div>
        <Table size="middle" columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.props.waveOrders} rowKey="so_no"
          pagination={{ showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
        />
      </div>
    );
  }
}
