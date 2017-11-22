import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Card, Table, Tag, Collapse, Badge, Dropdown, Menu, Icon } from 'antd';
import { EXPENSE_CATEGORIES, TMS_EXPENSE_TYPES, SHIPMENT_TRACK_STATUS } from 'common/constants';
import { showAdvanceModal, showSpecialChargeModal } from 'common/reducers/transportBilling';
import { loadShipmtCharges } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
// const Column = Table.Column;
const Panel = Collapse.Panel;
const CheckableTag = Tag.CheckableTag;
const categoryKeys = EXPENSE_CATEGORIES.filter(ec => ec.key !== 'all').map(ec => ec.key);

const typeKeys = TMS_EXPENSE_TYPES.map(ec => ec.key);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmt: state.shipment.previewer.shipmt,
    previewer: state.shipment.previewer,
    charges: state.shipment.charges,
    pAdvanceCharges: state.shipment.pAdvanceCharges,
    advanceCharges: state.shipment.advanceCharges,
    pSpecialCharges: state.shipment.pSpecialCharges,
    specialCharges: state.shipment.specialCharges,
  }), {
    showAdvanceModal,
    showSpecialChargeModal,
    loadShipmtCharges,
  }
)
export default class ExpensePanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    shipmt: PropTypes.object.isRequired,
    previewer: PropTypes.object.isRequired,
    showAdvanceModal: PropTypes.func.isRequired,
    showSpecialChargeModal: PropTypes.func.isRequired,
    loadShipmtCharges: PropTypes.func.isRequired,
    charges: PropTypes.object.isRequired,
    pAdvanceCharges: PropTypes.array.isRequired,
    advanceCharges: PropTypes.array.isRequired,
    pSpecialCharges: PropTypes.array.isRequired,
    specialCharges: PropTypes.array.isRequired,
  }
  state = {
    checkedExpCates: categoryKeys,
    checkedExpTypes: typeKeys,
  }
  componentDidMount() {
    this.handleLoad(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.previewer.visible && (nextProps.previewer.dispatch.id !== this.props.previewer.dispatch.id || !nextProps.previewer.loaded)) {
      this.handleLoad(nextProps);
    }
  }
  handleLoad = (props) => {
    this.props.loadShipmtCharges(props.previewer.dispatch.id, props.tenantId);
  }
  // handleReload = () => {
  //   this.handleLoad(this.props);
  // }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  currency = (number) => {
    if (typeof number === 'string') return number;
    else return number.toFixed(2);
  }
  feeColumns = [{
    title: this.msg('name'),
    dataIndex: 'name',
    width: 160,
    render: (col, record) => {
      if (record.type === 'serverCharge') {
        return (<Badge status="success" text={col} />);
      } else if (record.type === 'advanceCharge') {
        return (<Badge status="warning" text={col} />);
      } else if (record.type === 'specialCharge') {
        return (<Badge status="error" text={col} />);
      } else {
        return col;
      }
    },
  }, {
    title: this.msg('feeRemark'),
    dataIndex: 'remark',
    width: 180,
  }, {
    title: this.msg('amount'),
    dataIndex: 'amount',
    width: 80,
    render: this.currency,
  }, {
    title: this.msg('taxFee'),
    dataIndex: 'tax_fee',
    width: 80,
    render: this.currency,
  }, {
    title: this.msg('totalFee'),
    dataIndex: 'total_fee',
    width: 80,
    render: this.currency,
  }]
  paramColumns = [{
    title: this.msg('distance'),
    dataIndex: 'distance',
    render: col => col ? `${col} 公里` : '',
  }, {
    title: this.msg('totalWeight'),
    dataIndex: 'total_weight',
    render: col => col ? `${col} ${this.msg('kilogram')}` : '',
  }, {
    title: this.msg('totalVolume'),
    dataIndex: 'total_volume',
    render: col => col ? `${col} ${this.msg('cubicMeter')}` : '',
  }]
  handleRevenueMenuClick = (e) => {
    const { shipmt, previewer: { dispatch, upstream, downstream } } = this.props;
    const dispId = dispatch.id === downstream.id ? upstream.id : dispatch.id;
    const parentDispId = dispatch.id === downstream.id ? upstream.id : -1;
    if (e.key === 'advanceCharge') {
      this.props.showAdvanceModal({
        visible: true,
        dispId,
        shipmtNo: shipmt.shipmt_no,
        transModeCode: shipmt.transport_mode_code,
        goodsType: shipmt.goods_type,
        type: 1,
      });
    } else if (e.key === 'specialCharge') {
      this.props.showSpecialChargeModal({
        visible: true,
        dispId,
        shipmtNo: shipmt.shipmt_no,
        parentDispId,
        spTenantId: dispatch.sp_tenant_id,
        type: 1,
      });
    }
  }
  handleExpenseMenuClick = (e) => {
    const { shipmt, previewer: { dispatch, upstream, downstream } } = this.props;
    const dispId = dispatch.id === downstream.id ? downstream.id : -1;
    const parentDispId = dispatch.id === downstream.id ? upstream.id : -1;
    if (e.key === 'advanceCharge') {
      this.props.showAdvanceModal({
        visible: true,
        dispId,
        shipmtNo: shipmt.shipmt_no,
        transModeCode: shipmt.transport_mode_code,
        goodsType: shipmt.goods_type,
        type: -1,
      });
    } else if (e.key === 'specialCharge') {
      this.props.showSpecialChargeModal({
        visible: true,
        dispId,
        shipmtNo: shipmt.shipmt_no,
        parentDispId,
        spTenantId: dispatch.sp_tenant_id,
        type: -1,
      });
    }
  }
  assembleChargeItems(charge, outDs) {
    if (charge.freight_charge) {
      outDs.push({
        type: 'serverCharge',
        key: 'basic',
        name: this.msg('basicCharge'),
        remark: charge.charge_amount,
        amount: charge.freight_charge,
        tax_fee: '',
        total_fee: charge.freight_charge,
        checked: true,
      });
    }
    if (charge.pickup_charge) {
      outDs.push({
        type: 'serverCharge',
        key: 'pickup',
        name: this.msg('pickupCharge'),
        remark: '',
        amount: charge.pickup_charge,
        tax_fee: '',
        total_fee: charge.pickup_charge,
        checked: !!charge.pickup_checked,
      });
    }
    if (charge.deliver_charge) {
      outDs.push({
        type: 'serverCharge',
        key: 'deliver',
        name: this.msg('deliverCharge'),
        remark: '',
        amount: charge.deliver_charge,
        tax_fee: '',
        total_fee: charge.deliver_charge,
        checked: !!charge.deliver_checked,
      });
    }
    if (charge.surcharge) {
      outDs.push({
        type: 'serverCharge',
        key: 'surcharge',
        name: this.msg('surcharge'),
        remark: '',
        amount: charge.surcharge,
        tax_fee: '',
        total_fee: charge.surcharge,
        checked: true,
      });
    }
  }
  transAdvanceCharge = (advanceCharge, index) => ({
    type: 'advanceCharge',
    key: `advanceCharge${index}`,
    name: advanceCharge.name,
    remark: advanceCharge.remark,
    amount: advanceCharge.amount,
    tax_fee: advanceCharge.tax_fee,
    total_fee: advanceCharge.amount + advanceCharge.tax_fee,
  })
  transSpecialCharge = (specialCharge, index) => ({
    type: 'specialCharge',
    key: `specialCharge${index}`,
    name: '特殊费用',
    remark: specialCharge.remark,
    amount: specialCharge.amount,
    tax_fee: '',
    total_fee: specialCharge.amount,
  })
  calculateTotalCharge = (charges) => {
    const totalCharge = {
      key: 'totalCharge',
      name: '合计',
      remark: '',
      amount: 0,
      tax_fee: 0,
      total_fee: 0,
    };
    charges.forEach((charge) => {
      if (typeof charge.amount === 'number') totalCharge.amount += charge.amount;
      if (typeof charge.tax_fee === 'number') totalCharge.tax_fee += charge.tax_fee;
    });
    totalCharge.total_fee = totalCharge.amount + totalCharge.tax_fee;
    return totalCharge;
  }
  handleCateTagChange = (tag, checked) => {
    if (checked) {
      if (tag === 'all') {
        this.setState({
          checkedExpCates: categoryKeys,
          checkedExpTypes: typeKeys,
        });
      } else {
        this.setState({
          checkedExpCates: [...this.state.checkedExpCates, tag],
        });
      }
    } else {
      this.setState({
        checkedExpCates: this.state.checkedExpCates.filter(ec => ec !== tag),
      });
    }
  }
  handleTypeTagChange = (tag, checked) => {
    if (checked) {
      this.setState({
        checkedExpTypes: [...this.state.checkedExpTypes, tag],
      });
    } else {
      this.setState({
        checkedExpTypes: this.state.checkedExpTypes.filter(ec => ec !== tag),
      });
    }
  }

  render() {
    const { intl, shipmt, previewer: { dispatch }, charges, pAdvanceCharges, advanceCharges, pSpecialCharges, specialCharges } = this.props;
    const { checkedExpCates, checkedExpTypes } = this.state;

    let revenueds = [];
    let expenseds = [];
    let revenue = 0;
    let expense = 0;
    if (charges.revenue) {
      revenue = (charges.revenue.total_charge + charges.revenue.advance_charge +
        charges.revenue.excp_charge + charges.revenue.adjust_charge) || revenue;
      if (checkedExpCates.indexOf('service') >= 0) {
        this.assembleChargeItems(charges.revenue, revenueds);
      }
      if (checkedExpCates.indexOf('advance') >= 0) {
        revenueds = revenueds.concat(pAdvanceCharges.filter(item => checkedExpTypes.indexOf(item.category) >= 0).map(this.transAdvanceCharge));
      }
      if (checkedExpCates.indexOf('special') >= 0) {
        revenueds = revenueds.concat(pSpecialCharges.map(this.transSpecialCharge));
      }
      revenueds.push(this.calculateTotalCharge(revenueds));
    }
    if (charges.expense) {
      expense = (charges.expense.total_charge + charges.expense.advance_charge +
        charges.expense.excp_charge + charges.expense.adjust_charge) || expense;
      if (checkedExpCates.indexOf('service') >= 0) {
        this.assembleChargeItems(charges.expense, expenseds);
      }
      if (checkedExpCates.indexOf('advance') >= 0) {
        expenseds = expenseds.concat(advanceCharges.filter(item => checkedExpTypes.indexOf(item.category) >= 0).map(this.transAdvanceCharge));
      }
      if (checkedExpCates.indexOf('special') >= 0) {
        expenseds = expenseds.concat(specialCharges.map(this.transSpecialCharge));
      }
      expenseds.push(this.calculateTotalCharge(expenseds));
    }
    const profit = revenue - expense;
    let profitColor = '#87D068';
    if (profit === 0) {
      profitColor = '#666';
    } else if (profit < 0) {
      profitColor = '#f50';
    }
    const checkedTags = EXPENSE_CATEGORIES.map((ec) => {
      let checked = false;
      if (ec.key === 'all') {
        checked = checkedExpCates.length + checkedExpTypes.length + 1 === TMS_EXPENSE_TYPES.length + EXPENSE_CATEGORIES.length;
      } else {
        checked = checkedExpCates.indexOf(ec.key) !== -1;
      }
      const tagProps = {};
      if (checked) {
        tagProps.style = { backgroundColor: ec.color };
      }
      return (
        <CheckableTag key={ec.key} checked={checked} {...tagProps}
          onChange={chked => this.handleCateTagChange(ec.key, chked)}
        >{ec.text}</CheckableTag>);
    }).concat(
      TMS_EXPENSE_TYPES.map(et => (
        <CheckableTag key={et.key} checked={checkedExpTypes.indexOf(et.key) !== -1}
          onChange={chked => this.handleTypeTagChange(et.key, chked)}
        >{et.text}</CheckableTag>))
    );
    const paramDataSource = [{ key: 0, distance: shipmt.distance, total_weight: shipmt.total_weight, total_volume: shipmt.total_volume }];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }} hoverable={false}>
          <Row>
            <Col span="8">
              <h5>收入</h5>
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
              <h5>盈亏</h5>
              <div style={{ color: profitColor, fontSize: '18px' }}>{
                intl.formatNumber(profit.toFixed(2), { style: 'currency', currency: 'cny' })
              }</div>
            </Col>
          </Row>
        </Card>
        <div className="pane-header">
          {checkedTags}
          {dispatch.status >= SHIPMENT_TRACK_STATUS.intransit &&
          <div style={{ float: 'right' }}>
            <Dropdown overlay={
              <Menu selectedKeys={[]} onClick={this.handleRevenueMenuClick}>
                <Menu.Item key="advanceCharge">代垫费用</Menu.Item>
                <Menu.Item key="specialCharge">特殊费用</Menu.Item>
              </Menu>
            }
            >
              <a >
                <Icon type="down-circle-o" /> 记录应收 <Icon type="down" />
              </a>
            </Dropdown>
            <Dropdown overlay={
              <Menu selectedKeys={[]} onClick={this.handleExpenseMenuClick}>
                <Menu.Item key="advanceCharge">代垫费用</Menu.Item>
                <Menu.Item key="specialCharge">特殊费用</Menu.Item>
              </Menu>
            }
            >
              <a style={{ marginLeft: 30 }}>
                <Icon type="up-circle-o" /> 记录应付 <Icon type="down" />
              </a>
            </Dropdown>
          </div>}
        </div>
        <Card bodyStyle={{ padding: 0 }} hoverable={false}>
          <Collapse bordered={false} defaultActiveKey={['revenue', 'cost']}>
            <Panel header={this.msg('revenueDetail')} key="revenue" className="table-panel">
              <Table size="small" columns={this.feeColumns} pagination={false} dataSource={revenueds} />
            </Panel>
            <Panel header={this.msg('costDetail')} key="cost" className="table-panel">
              <Table size="small" columns={this.feeColumns} pagination={false} dataSource={expenseds} />
            </Panel>
            <Panel header="计费参数" key="params" className="table-panel">
              <Table size="small" columns={this.paramColumns} pagination={false} dataSource={paramDataSource} />
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
