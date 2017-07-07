import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button } from 'antd';
import { openAllocatingModal } from 'common/reducers/cwmOutbound';
import { loadWaveDetails } from 'common/reducers/cwmShippingOrder';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
  }),
  { openAllocatingModal, loadWaveDetails }
)
export default class OrderDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    waveNo: PropType.string.isRequired,
  }
  state = {
    selectedRowKeys: [],
    details: [],
  }
  componentWillMount() {
    this.props.loadWaveDetails(this.props.waveNo).then((result) => {
      this.setState({
        details: result.data,
      });
    });
  }
  columns = [{
    title: '行号',
    dataIndex: 'wave_seq_no',
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
    dataIndex: 'unit_name',
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
  }]
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
          </div>
          <div className="toolbar-right">
            {!this.state.allocated && <Button size="large" onClick={this.handleAutoAllocate} >合并</Button>}
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} indentSize={0} dataSource={this.state.details} rowKey="wave_seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
