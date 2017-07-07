import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button } from 'antd';
import { loadWaveOrders, removeWaveOrders, loadWaveHead, loadWaveDetails } from 'common/reducers/cwmShippingOrder';
import { CWM_SO_TYPES } from 'common/constants';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { loadWaveOrders, removeWaveOrders, loadWaveHead, loadWaveDetails }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
    orders: [],
  }
  componentWillMount() {
    this.props.loadWaveOrders(this.props.waveNo).then((result) => {
      if (!result.error) {
        this.setState({
          orders: result.data,
        });
      }
    });
  }
  handleReload = () => {
    this.props.loadWaveOrders(this.props.waveNo).then((result) => {
      if (!result.error) {
        this.setState({
          orders: result.data,
        });
      }
    });
  }
  columns = [{
    title: '行号',
    width: 40,
    render: (o, record, index) => index + 1,
  }, {
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 120,
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
  }, {
    title: '收货人',
    dataIndex: 'receiver_name',
    width: 120,
    render: o => (<b>{o}</b>),
  }, {
    title: '承运人',
    dataIndex: 'carrier_name',
    width: 60,
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: o => moment(o).format('YYYY.MM.DD'),
  }, {
    title: '要求出货日期',
    dataIndex: 'expect_shipping_date',
    width: 120,
    render: o => moment(o).format('YYYY.MM.DD'),
  }]
  handleRemoveOrders = () => {
    this.props.removeWaveOrders(this.state.selectedRowKeys, this.props.waveNo).then((result) => {
      if (!result.error) {
        this.handleReload();
        this.props.loadWaveHead(this.props.waveNo);
        this.props.loadWaveDetails(this.props.waveNo);
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
      <div>
        <div className="toolbar">
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            <Button size="large" onClick={this.handleRemoveOrders} icon="close">
              移除订单
            </Button>
          </div>
          <div className="toolbar-right" />
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.state.orders} rowKey="so_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
