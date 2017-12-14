import React from 'react';
import PropTypes from 'prop-types';
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
    order: state.crmOrders.dock.order,
    delgNos: state.crmOrders.dock.order.ccb_delg_no,
    transports: state.crmOrders.dock.transports,
    clearanceFees: state.crmOrders.dock.clearanceFees,
  }),
  { loadClearanceFees }
)
export default class BillingPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadClearanceFees: PropTypes.func.isRequired,
    delgNos: PropTypes.string.isRequired,
    order: PropTypes.object.isRequired,
    transports: PropTypes.array.isRequired,
    clearanceFees: PropTypes.array.isRequired,
  }
  state = {
    tabKey: '',
  }
  componentWillMount() {
    const {
      delgNos, transports, order, clearanceFees,
    } = this.props;
    if (delgNos) {
      this.props.loadClearanceFees(delgNos);
    }
    let tabKey = transports[0] ? transports[0].shipmt_no : '';
    if (order.shipmt_order_mode.indexOf(CRM_ORDER_MODE.clearance) >= 0 && clearanceFees.length > 0) {
      tabKey = clearanceFees[0].delg_no;
    }
    this.setState({
      tabKey,
    });
  }
  componentWillReceiveProps(nextProps) {
    const {
      delgNos, transports, order, clearanceFees,
    } = nextProps;
    if (delgNos && delgNos !== this.props.delgNos) {
      this.props.loadClearanceFees(delgNos);
    }
    let tabKey = transports[0] ? transports[0].shipmt_no : '';
    if (order.shipmt_order_mode.indexOf(CRM_ORDER_MODE.clearance) >= 0 && clearanceFees.length > 0) {
      tabKey = clearanceFees[0].delg_no;
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
  renderClearanceFees = (clearanceFee) => {
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
      dataIndex: 'cal_fee',
      key: 'cal_fee',
      width: '16.7%',
      render: col => col.toFixed(2),
    }, {
      title: this.msg('taxFee'),
      dataIndex: 'tax_fee',
      key: 'tax_fee',
      width: '16.7%',
      render: col => col.toFixed(2),
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '16.7%',
      render: col => col.toFixed(2),
    }];
    const cushColumns = [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
    }, {
      title: this.msg('feeVal'),
      dataIndex: 'cal_fee',
      key: 'cal_fee',
      render: col => col.toFixed(2),
    }, {
      title: this.msg('taxFee'),
      dataIndex: 'tax_fee',
      key: 'tax_fee',
      render: col => col.toFixed(2),
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      render: col => col.toFixed(2),
    }];
    const totalServFee = {
      fee_name: '合计',
      cal_fee: 0,
      tax_fee: 0,
      total_fee: 0,
    };
    clearanceFee.server_charges.forEach((fee) => {
      totalServFee.cal_fee += fee.cal_fee;
      totalServFee.tax_fee += fee.tax_fee;
      totalServFee.total_fee += fee.total_fee;
    });
    totalServFee.cal_fee = totalServFee.cal_fee;
    totalServFee.tax_fee = totalServFee.tax_fee;
    totalServFee.total_fee = totalServFee.total_fee;

    const totalCushFee = {
      fee_name: '合计',
      cal_fee: 0,
      tax_fee: 0,
      total_fee: 0,
    };
    clearanceFee.cush_charges.forEach((fee) => {
      totalCushFee.cal_fee += fee.cal_fee;
      totalCushFee.tax_fee += fee.tax_fee;
      totalCushFee.total_fee += fee.total_fee;
    });

    totalCushFee.cal_fee = totalCushFee.cal_fee;
    totalCushFee.tax_fee = totalCushFee.tax_fee;
    totalCushFee.total_fee = totalCushFee.total_fee;

    return (
      <div className="pane-content tab-pane">
        <Row>
          <Col span={14} style={{ paddingLeft: 8, paddingRight: 8 }}>
            <Card title={this.msg('serviceFee')} bodyStyle={{ padding: 8 }}>
              <Table size="small" columns={columns} dataSource={clearanceFee.server_charges.concat(totalServFee)} rowKey="_id" pagination={false} />
            </Card>
          </Col>
          <Col span={10} style={{ paddingLeft: 8, paddingRight: 8 }}>
            <Card title={this.msg('cushionFee')} bodyStyle={{ padding: 8 }}>
              <Table size="small" columns={cushColumns} dataSource={clearanceFee.cush_charges.concat(totalCushFee)} rowKey="_id" pagination={false} />
            </Card>
          </Col>
        </Row>
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
        <Table size="small" columns={revenueColumns} pagination={false} dataSource={revenueds} />
        <Table size="small" columns={advancesColumns} pagination={false} dataSource={advances} />
        <Table size="small" columns={specialChargeColumns} pagination={false} dataSource={specialCharges} />
      </div>
    );
  }
  render() {
    const {
      intl, order, transports, clearanceFees,
    } = this.props;
    let clearanceFee = 0;
    let transportFee = 0;
    if (order.shipmt_order_mode.indexOf(CRM_ORDER_MODE.clearance) >= 0) {
      clearanceFees.forEach((fee) => {
        fee.server_charges.forEach((item) => {
          clearanceFee += item.total_fee;
        });
        fee.cush_charges.forEach((item) => {
          clearanceFee += item.total_fee;
        });
      });
    }
    if (order.shipmt_order_mode.indexOf(CRM_ORDER_MODE.transport) >= 0) {
      transports.forEach((item) => {
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
      if (clearanceFees.length === 1) {
        return (
          <div className="pane-content tab-pane" >
            <Card bodyStyle={{ padding: 16 }}>
              <Row>
                <h5>清关</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(clearanceFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }
                </div>
              </Row>
            </Card>
            {this.renderClearanceFees(clearanceFees[0])}
          </div>
        );
      } else {
        return (
          <div className="pane-content tab-pane" >
            <Card bodyStyle={{ padding: 16 }}>
              <Row>
                <h5>清关</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(clearanceFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }
                </div>
              </Row>
            </Card>
            <Card bodyStyle={{ padding: 16 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleChangeTab}>
                {clearanceFees.map(item => (
                  <TabPane tab={item.delg_no} key={item.delg_no}>
                    {this.renderClearanceFees(item)}
                  </TabPane>
                  ))}
              </Tabs>
            </Card>
          </div>
        );
      }
    } else if (order.shipmt_order_mode === CRM_ORDER_MODE.transport) {
      if (transports.length === 1) {
        return (
          <div className="pane-content tab-pane" >
            <Card bodyStyle={{ padding: 16 }}>
              <Row>
                <h5>运输</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(transportFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }
                </div>
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
                  }
                </div>
              </Row>
            </Card>
            <Card bodyStyle={{ padding: 16 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleChangeTab}>
                {transports.map(item => (
                  <TabPane tab={item.shipmt_no} key={item.shipmt_no}>
                    {this.renderTransportFees(item)}
                  </TabPane>
                  ))}
              </Tabs>
            </Card>
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
                  }
                </div>
              </Col>
              <Col span="8">
                <h5>运输</h5>
                <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                    intl.formatNumber(transportFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }
                </div>
              </Col>
              <Col span="8">
                <h5>总计</h5>
                <div style={{ color: '#666', fontSize: '18px' }}>{
                    intl.formatNumber(totalFee.toFixed(2), { style: 'currency', currency: 'cny' })
                  }
                </div>
              </Col>
            </Row>
          </Card>
          <Card bodyStyle={{ padding: 16 }}>
            <Tabs activeKey={this.state.tabKey} onChange={this.handleChangeTab}>
              {clearanceFees.map(item => (
                <TabPane tab={item.delg_no} key={item.delg_no}>
                  {this.renderClearanceFees(item)}
                </TabPane>
                )).concat(transports.map(item => (
                  <TabPane tab={item.shipmt_no} key={item.shipmt_no}>
                    {this.renderTransportFees(item)}
                  </TabPane>
                )))}
            </Tabs>
          </Card>
        </div>
      );
    }
  }
}
