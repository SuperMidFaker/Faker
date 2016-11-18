import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Table, Tabs, Checkbox } from 'antd';
import { CRM_ORDER_MODE } from 'common/constants';
import { loadClearanceFees } from 'common/reducers/crmOrders';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    order: state.crmOrders.previewer.order,
    delgNo: state.crmOrders.previewer.order.ccb_delg_no,
    transports: state.crmOrders.previewer.transports,
    clearanceFees: state.crmOrders.previewer.clearanceFees,
  }),
  { loadClearanceFees }
)
export default class ChargePanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadClearanceFees: PropTypes.func.isRequired,
    delgNo: PropTypes.string.isRequired,
    order: PropTypes.object.isRequired,
    transports: PropTypes.array.isRequired,
    clearanceFees: PropTypes.object.isRequired,
  }
  state = {
    tabKey: '',
  }
  componentWillMount() {
    const { delgNo, transports, order } = this.props;
    if (delgNo && delgNo !== this.props.delgNo) {
      this.props.loadClearanceFees(delgNo);
    }
    let tabKey = transports[0] ? transports[0].shipmt_no : '';
    if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance || order.shipmt_order_mode === CRM_ORDER_MODE.clearanceAndTransport) {
      tabKey = delgNo;
    }
    this.setState({
      tabKey,
    });
  }
  componentWillReceiveProps(nextProps) {
    const { delgNo, transports, order } = nextProps;
    if (delgNo && delgNo !== this.props.delgNo) {
      this.props.loadClearanceFees(delgNo);
    }
    let tabKey = transports[0] ? transports[0].shipmt_no : '';
    if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance || order.shipmt_order_mode === CRM_ORDER_MODE.clearanceAndTransport) {
      tabKey = delgNo;
    }
    this.setState({
      tabKey,
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleChangeTab = (tabKey) => {
    this.setState({
      tabKey,
    });
  }
  assembleChargeItems(charge, outDs) {
    const { intl } = this.props;
    if (charge.freight_charge) {
      outDs.push({
        key: 'basic',
        item: this.msg('basicCharge'),
        rate: charge.charge_gradient,
        amount: charge.charge_amount,
        fee: intl.formatNumber(charge.freight_charge, {
          style: 'currency',
          currency: 'CNY',
        }),
        checked: true,
      });
    }
    if (charge.pickup_charge) {
      outDs.push({
        key: 'pickup',
        item: this.msg('pickupCharge'),
        rate: charge.pickup_charge,
        amount: '',
        fee: intl.formatNumber(charge.pickup_charge, {
          style: 'currency',
          currency: 'CNY',
        }),
        checked: !!charge.pickup_checked,
      });
    }
    if (charge.deliver_charge) {
      outDs.push({
        key: 'deliver',
        item: this.msg('deliverCharge'),
        rate: charge.deliver_charge,
        amount: '',
        fee: intl.formatNumber(charge.deliver_charge, {
          style: 'currency',
          currency: 'CNY',
        }),
        checked: !!charge.deliver_checked,
      });
    }
    if (charge.surcharge) {
      outDs.push({
        key: 'surcharge',
        item: this.msg('surcharge'),
        rate: '',
        amount: '',
        fee: intl.formatNumber(charge.surcharge, {
          style: 'currency',
          currency: 'CNY',
        }),
        checked: true,
      });
    }
    if (charge.total_charge) {
      outDs.push({
        key: 'total',
        item: this.msg('totalCharge'),
        rate: '',
        amount: '',
        fee: intl.formatNumber(charge.total_charge, {
          style: 'currency',
          currency: 'cny',
        }),
      });
    }
  }
  renderClearanceFees = () => {
    const { clearanceFees } = this.props;
    const columns = [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '16.7%',
    }, {
      title: this.msg('charCount'),
      dataIndex: 'charge_count',
      key: 'charge_count',
      width: '16.7%',
    }, {
      title: this.msg('unitPrice'),
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '16.7%',
    }, {
      title: this.msg('feeVal'),
      dataIndex: 'sum_fee',
      key: 'sum_fee',
      width: '16.7%',
    }, {
      title: this.msg('taxFee'),
      dataIndex: 'tax_fee',
      key: 'tax_fee',
      width: '16.7%',
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '16.7%',
      render: (o) => {
        if (o) {
          return o.toFixed(2);
        }
      },
    }];
    const cushColumns = [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '40%',
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '60%',
    }];
    const servDataSource = clearanceFees.server_charges;
    if (clearanceFees.tot_sercharges && clearanceFees.tot_sercharges.fee_name) {
      servDataSource.push(clearanceFees.tot_sercharges);
    }
    const cushDataSource = clearanceFees.cush_charges;
    return (
      <div className="pane-content tab-pane">
        <Card title={this.msg('serviceFee')} bodyStyle={{ padding: 8 }}>
          <Table size="small" columns={columns} dataSource={servDataSource} rowKey="id" pagination={false} />
        </Card>
        <Card title={this.msg('cushionFee')} bodyStyle={{ padding: 8 }}>
          <Table size="small" columns={cushColumns} dataSource={cushDataSource} rowKey="id" pagination={false} />
        </Card>
      </div>
    );
  }
  renderTransportFees = (shipmt) => {
    const { fees, advances, specialCharges } = shipmt;
    const revenueColumns = [{
      title: this.msg('revenueItem'),
      dataIndex: 'item',
      width: 100,
    }, {
      title: this.msg('chargeRate'),
      dataIndex: 'rate',
      width: 100,
    }, {
      title: this.msg('chargeAmount'),
      dataIndex: 'amount',
      width: 200,
    }, {
      title: this.msg('chargeFee'),
      dataIndex: 'fee',
      width: 180,
    }, {
      title: this.msg('chargeChecked'),
      dataIndex: 'checked',
      width: 80,
      render: (o) => {
        if (o === true) {
          return <Checkbox checked disabled />;
        } else {
          return null;
        }
      },
    }];
    const advancesColumns = [{
      title: this.msg('advanceName'),
      dataIndex: 'name',
      width: 80,
      render: (o, record) => {
        if (record.photos !== '') {
          return (<a href={record.photos.split(',')} target="_blank" rel="noopener noreferrer">{o}</a>);
        } else {
          return o;
        }
      },
    }, {
      title: this.msg('advanceSubmitter'),
      dataIndex: 'submitter',
      width: 100,
    }, {
      title: this.msg('advanceRemark'),
      dataIndex: 'remark',
      width: 240,
    }, {
      title: this.msg('advanceAmount'),
      dataIndex: 'amount',
      width: 180,
      render: o => this.props.intl.formatNumber(o, {
        style: 'currency',
        currency: 'CNY',
      }),
    }];
    const specialChargeColumns = [{
      title: '收付类别',
      dataIndex: 'type',
      width: 80,
      render: (o) => {
        if (o === 1) {
          return '应收';
        } else {
          return '应付';
        }
      },
    }, {
      title: this.msg('advanceSubmitter'),
      dataIndex: 'submitter',
      width: 100,
    }, {
      title: this.msg('advanceRemark'),
      dataIndex: 'remark',
      width: 240,
    }, {
      title: this.msg('advanceAmount'),
      dataIndex: 'amount',
      width: 180,
      render: o => this.props.intl.formatNumber(o, {
        style: 'currency',
        currency: 'CNY',
      }),
    }];
    const revenueds = [];
    this.assembleChargeItems(fees, revenueds);

    return (
      <div className="pane-content tab-pane">

        <Card bodyStyle={{ padding: 0 }}>
          <Table size="small" columns={revenueColumns} pagination={false} dataSource={revenueds} />
        </Card>
        <Card bodyStyle={{ padding: 0 }} title="代垫费用">
          <Table size="small" columns={advancesColumns} pagination={false} dataSource={advances} />
        </Card>
        <Card bodyStyle={{ padding: 0 }} title="特殊费用">
          <Table size="small" columns={specialChargeColumns} pagination={false} dataSource={specialCharges} />
        </Card>
      </div>
    );
  }
  render() {
    const { intl, order, transports, clearanceFees } = this.props;
    let clearanceFee = 0;
    let transportFee = 0;
    if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance || order.shipmt_order_mode === CRM_ORDER_MODE.clearanceAndTransport) {
      const servDataSource = clearanceFees.server_charges;
      if (clearanceFees.tot_sercharges.fee_name) {
        servDataSource.push(clearanceFees.tot_sercharges);
      }
      const cushDataSource = clearanceFees.cush_charges;
      servDataSource.forEach((item) => {
        clearanceFee += item.total_fee;
      });
      cushDataSource.forEach((item) => {
        clearanceFee += item.total_fee;
      });
    }
    if (order.shipmt_order_mode === CRM_ORDER_MODE.transport || order.shipmt_order_mode === CRM_ORDER_MODE.clearanceAndTransport) {
      transports.forEach((item) => {
        // console.log(item);
        if (item.fees.advance_charge) {
          transportFee += item.fees.advance_charge;
        }
        if (item.fees.excp_charge) {
          transportFee += item.fees.excp_charge;
        }
        if (item.fees.adjust_charge) {
          transportFee += item.fees.adjust_charge;
        }
        if (item.fees.total_charge) {
          transportFee += item.fees.total_charge;
        }
      });
    }
    const totalFee = clearanceFee + transportFee;
    if (order.shipmt_order_mode === CRM_ORDER_MODE.clearance) {
      return (
        <div className="pane-content tab-pane" >
          <Card bodyStyle={{ padding: 16 }}>
            <Row>
              <h5>清关</h5>
              <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                  intl.formatNumber(clearanceFee.toFixed(2), { style: 'currency', currency: 'cny' })
                }</div>
            </Row>
          </Card>
          {this.renderClearanceFees()}
        </div>
      );
    } else if (order.shipmt_order_mode === CRM_ORDER_MODE.transport) {
      if (transports.length === 1) {
        return (
          <div className="pane-content tab-pane" >
            <Card bodyStyle={{ padding: 16 }}>
              <Row>
                <h5>运输</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(transportFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }</div>
              </Row>
            </Card>
            {this.renderTransportFees(transports[0])}
          </div>
        );
      } else {
        return (
          <div className="pane-content tab-pane" >
            <Card bodyStyle={{ padding: 16 }}>
              <Row>
                <h5>运输</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(transportFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }</div>
              </Row>
            </Card>
            <Tabs activeKey={this.state.tabKey} tabPosition="left" onChange={this.handleChangeTab}>
              {transports.map((item) => {
                return (
                  <TabPane tab={item.shipmt_no} key={item.shipmt_no}>
                    {this.renderTransportFees(item)}
                  </TabPane>
                  );
              })}
            </Tabs>
          </div>
        );
      }
    } else {
      return (
        <div className="pane-content tab-pane" >
          <Card bodyStyle={{ padding: 16 }}>
            <Row>
              <Col span="8">
                <h5>清关</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(clearanceFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }</div>
              </Col>
              <Col span="8">
                <h5>运输</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(transportFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }</div>
              </Col>
              <Col span="8">
                <h5>总计</h5>
                <div style={{ color: '#666', fontSize: '18px' }}>{
                    intl.formatNumber(totalFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }</div>
              </Col>
            </Row>
          </Card>
          <Tabs activeKey={this.state.tabKey} tabPosition="left" onChange={this.handleChangeTab}>
            <TabPane tab={order.ccb_delg_no} key={order.ccb_delg_no}>
              {this.renderClearanceFees()}
            </TabPane>
            {transports.map((item) => {
              return (
                <TabPane tab={item.shipmt_no} key={item.shipmt_no}>
                  {this.renderTransportFees(item)}
                </TabPane>
                );
            })}
          </Tabs>
        </div>
      );
    }
  }
}
