import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Card, Tabs, Table, Select } from 'antd';
import QuantityInput from '../../../common/quantityInput';
import { getInboundDetail, loadInboundPutaways } from 'common/reducers/cwmReceive';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    locations: state.cwmWarehouse.locations,
  }),
  { getInboundDetail, loadInboundPutaways }
)

export default class InboundCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
  }
  state = {
    inbound: [],
    putaway: [],
  }
  componentWillMount() {
    this.props.getInboundDetail(this.props.inboundNo).then((result) => {
      if (!result.error) {
        this.setState({
          inbound: result.data.inboundProducts,
        });
      }
    });
    this.props.loadInboundPutaways(this.props.inboundNo).then((result) => {
      if (!result.error) {
        this.setState({
          putaway: result.data,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.inboundNo !== this.props.inboundNo) {
      this.props.getInboundDetail(nextProps.inboundNo).then((result) => {
        if (!result.error) {
          this.setState({
            inbound: result.data.inboundProducts,
          });
        }
      });
      this.props.loadInboundPutaways(nextProps.inboundNo).then((result) => {
        if (!result.error) {
          this.setState({
            putaway: result.data,
          });
        }
      });
    }
  }
  inboundColumns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 150,
  }, {
    title: '预期数量',
    width: 180,
    render: (o, record) => (<QuantityInput size="small" packQty={record.expect_pack_qty} pcsQty={record.expect_qty} disabled />),
  }, {
    title: '收货数量',
    width: 180,
    render: (o, record) => (<QuantityInput size="small" packQty={record.received_pack_qty} pcsQty={record.received_qty}
      alert={record.expect_pack_qty !== record.receive_pack_qty} disabled
    />),
  }, {
    title: '收货库位',
    dataIndex: 'location',
    width: 180,
    render: (o, record) => {
      const Options = this.props.locations.map(location => (<Option key={location.id} value={location.location}>{location.location}</Option>));
      if (record.location.length <= 1) {
        return (
          <Select size="small" className="readonly" value={o[0]} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      } else {
        return (
          <Select size="small" className="readonly" mode="tags" value={o} style={{ width: 160 }} disabled>
            {Options}
          </Select>);
      }
    },
  }, {
    title: '包装情况',
    dataIndex: 'damage_level',
    width: 120,
    render: damage => (
      <Select size="small" className="readonly" value={damage} style={{ width: 100 }} disabled>
        <Option value={0}>完好</Option>
        <Option value={1}>轻微擦痕</Option>
        <Option value={2}>中度</Option>
        <Option value={3}>重度</Option>
        <Option value={4}>严重磨损</Option>
      </Select>),
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 100,
  }]

  putawayColumns = [{
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 120,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 150,
  }, {
    title: '上架库位',
    dataIndex: 'putaway_location',
    width: 120,
  }, {
    title: '上架数量',
    width: 180,
    render: (o, record) => (<QuantityInput size="small" packQty={record.inbound_pack_qty} pcsQty={record.inbound_qty} disabled />),
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 100,
  }]
  render() {
    const { inboundNo } = this.props;
    const { inbound, putaway } = this.state;
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <Collapse bordered={false} defaultActiveKey={['receiveDetails', 'putAwayDetails']}>
          <Panel header={inboundNo} key="receiveDetails" >
            <Tabs defaultActiveKey="inbound">
              <TabPane tab="收货明细" key="inbound">
                <Table size="middle" columns={this.inboundColumns} dataSource={inbound} scroll={{ x: 1210 }} />
              </TabPane>
              <TabPane tab="上架明细" key="putaway" >
                <Table size="middle" columns={this.putawayColumns} dataSource={putaway} scroll={{ x: 1230 }} />
              </TabPane>
            </Tabs>
          </Panel>
        </Collapse>
      </Card>
    );
  }
}
