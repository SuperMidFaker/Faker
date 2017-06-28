import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Card, Tabs, Table, Select } from 'antd';
import QuantityInput from '../../../common/quantityInput';
import { loadDockInbounds } from 'common/reducers/cwmReceive';
// import InfoItem from 'client/components/InfoItem';
// import { MdIcon } from 'client/components/FontIcon';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    order: state.crmOrders.dock.order,
    locations: state.cwmWarehouse.locations,
  }),
  { loadDockInbounds }
)
export default class InboundPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    asnNo: PropTypes.string.isRequired,
  }
  state = {
    tabKey: '',
    data: [],
  }
  componentWillMount() {
    this.props.loadDockInbounds(this.props.asnNo).then((result) => {
      if (!result.error) {
        this.setState({
          data: result.data,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.asnNo !== this.props.asnNo) {
      this.props.loadDockInbounds(nextProps.asnNo).then((result) => {
        if (!result.error) {
          this.setState({
            data: result.data,
          });
        }
      });
    }
  }
  inboundColumns = [{
    title: '序号',
    dataIndex: 'asn_seq_no',
    width: 50,
    fixed: 'left',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
    fixed: 'left',
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 60,
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
    title: '破损级别',
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
  }, {
    title: '收货人',
    width: 60,
    dataIndex: 'received_by',
  }, {
    title: '收货时间',
    width: 100,
    dataIndex: 'received_date',
  }]

  putawayColumns = [{
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
    fixed: 'left',
  }, {
    title: '上架库位',
    dataIndex: 'putaway_location',
    width: 120,
  }, {
    title: '目标库位',
    dataIndex: 'target_location',
    width: 120,
  }, {
    title: '收货库位',
    dataIndex: 'receive_location',
    width: 120,
  }, {
    title: '收货数量',
    width: 180,
    render: (o, record) => (<QuantityInput size="small" packQty={record.inbound_pack_qty} pcsQty={record.inbound_qty} disabled />),
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 100,
  }, {
    title: '上架人',
    width: 100,
    dataIndex: 'allocate_by',
  }, {
    title: '上架时间',
    width: 100,
    dataIndex: 'allocate_date',
    render: allocateDt => allocateDt && moment(allocateDt).format('YYYY.MM.DD'),
  }]
  render() {
    const { data } = this.state;
    return (
      <div className="pane-content tab-pane">
        {
          data.map(item => (
            <Card bodyStyle={{ padding: 0 }}>
              <Collapse bordered={false} defaultActiveKey={['receiveDetails', 'putAwayDetails']}>
                <Panel header={item.inbound[0].inbound_no} key="receiveDetails" >
                  <Card>
                    <Tabs defaultActiveKey="inbound">
                      <TabPane tab="收货明细" key="inbound">
                        <Table columns={this.inboundColumns} dataSource={item.inbound} scroll={{ x: 1150 }} />
                      </TabPane>
                      <TabPane tab="上架明细" key="putaway" >
                        <Table columns={this.putawayColumns} dataSource={item.putaway} scroll={{ x: 1230 }} />
                      </TabPane>
                    </Tabs>
                  </Card>
                </Panel>
              </Collapse>
            </Card>
          ))
        }
      </div>
    );
  }
}
