import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Card, Tabs, Table, Select } from 'antd';
import { getInboundDetail, loadInboundPutaways } from 'common/reducers/cwmReceive';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
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
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '预期数量',
    dataIndex: 'expect_qty',
    width: 100,
    align: 'right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '收货数量',
    dataIndex: 'received_qty',
    width: 100,
    align: 'right',
    render: (o, record) => {
      if (record.received_qty === record.expect_qty) {
        return (<span className="text-success">{o}</span>);
      } else if (record.received_qty < record.expect_qty) {
        return (<span className="text-warning">{o}</span>);
      } else if (record.received_qty > record.expect_qty) {
        return (<span className="text-error">{o}</span>);
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
  }]

  putawayColumns = [{
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,
  }, {
    title: '收货数量',
    dataIndex: 'inbound_qty',
    width: 180,
    align: 'right',
  }, {
    title: '上架库位',
    dataIndex: 'putaway_location',
    width: 120,
  }]
  render() {
    const { inboundNo } = this.props;
    const { inbound, putaway } = this.state;
    return (
      <Card bodyStyle={{ padding: 0 }} >
        <Collapse bordered={false} defaultActiveKey={['receiveDetails', 'putAwayDetails']}>
          <Panel header={inboundNo} key="receiveDetails" >
            <Tabs defaultActiveKey="inbound">
              <TabPane tab="收货明细" key="inbound">
                <div className="table-panel table-fixed-layout">
                  <Table size="middle" columns={this.inboundColumns} dataSource={inbound} />
                </div>
              </TabPane>
              <TabPane tab="上架明细" key="putaway" >
                <div className="table-panel table-fixed-layout">
                  <Table size="middle" columns={this.putawayColumns} dataSource={putaway} />
                </div>
              </TabPane>
            </Tabs>
          </Panel>
        </Collapse>
      </Card>
    );
  }
}
