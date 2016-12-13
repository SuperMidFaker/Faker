import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Table, Checkbox } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    charges: state.shipment.previewer.charges,
    advances: state.shipment.previewer.advances,
    specialCharges: state.shipment.previewer.specialCharges,
  })
)
export default class ChargePanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    charges: PropTypes.object.isRequired,
    advances: PropTypes.array.isRequired,
    specialCharges: PropTypes.array.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  revenueColumns = [{
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
  }]
  expenseColumns = [{
    title: this.msg('expenseItem'),
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
  }]
  advancesColumns = [{
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
  }]
  specialChargeColumns = [{
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
  }]
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
  render() {
    const { charges, advances, specialCharges, intl } = this.props;
    const revenueds = [];
    const expenseds = [];
    let revenue = 0;
    let expense = 0;
    if (charges.revenue) {
      revenue = charges.revenue.total_charge || revenue;
      this.assembleChargeItems(charges.revenue, revenueds);
    }
    if (charges.expense) {
      expense = charges.expense.total_charge || expense;
      this.assembleChargeItems(charges.expense, expenseds);
    }
    const profit = revenue - expense;
    let profitColor = '#87D068';
    if (profit === 0) {
      profitColor = '#666';
    } else if (profit < 0) {
      profitColor = '#f50';
    }
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col span="8">
              <h5>营收</h5>
              <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                intl.formatNumber(revenue.toFixed(2), { style: 'currency', currency: 'cny' })
              }</div>
            </Col>
            <Col span="8">
              <h5>成本</h5>
              <div style={{ color: '#2DB7F5', fontSize: '18px' }}>{
                intl.formatNumber(expense.toFixed(2), { style: 'currency', currency: 'cny' })
              }</div>
            </Col>
            <Col span="8">
              <h5>利润</h5>
              <div style={{ color: profitColor, fontSize: '18px' }}>{
                intl.formatNumber(profit.toFixed(2), { style: 'currency', currency: 'cny' })
              }</div>
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Table size="small" columns={this.revenueColumns} pagination={false} dataSource={revenueds} />
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Table size="small" columns={this.expenseColumns} pagination={false} dataSource={expenseds} />
        </Card>
        <Card bodyStyle={{ padding: 0 }} title="代垫费用">
          <Table size="small" columns={this.advancesColumns} pagination={false} dataSource={advances} />
        </Card>
        <Card bodyStyle={{ padding: 0 }} title="特殊费用">
          <Table size="small" columns={this.specialChargeColumns} pagination={false} dataSource={specialCharges} />
        </Card>
      </div>
    );
  }
}
