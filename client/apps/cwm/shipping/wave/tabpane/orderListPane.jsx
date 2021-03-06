import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
// import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { loadWaveOrders, removeWaveOrders, loadWaveHead, loadWaveDetails } from 'common/reducers/cwmShippingOrder';
import { CWM_SO_TYPES } from 'common/constants';


// @injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    waveOrders: state.cwmShippingOrder.waveOrders,
    reload: state.cwmShippingOrder.waveReload,
  }),
  {
    loadWaveOrders, removeWaveOrders, loadWaveHead, loadWaveDetails,
  }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    // intl: intlShape.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadWaveOrders(this.props.waveNo);
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
    width: 100,
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
      <DataPane

        columns={this.columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={this.props.waveOrders}
        rowKey="so_no"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder="SO编号" onSearch={this.handleSearch} />
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleRemoveOrders} icon="close">
              移除订单
            </Button>
          </DataPane.BulkActions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
