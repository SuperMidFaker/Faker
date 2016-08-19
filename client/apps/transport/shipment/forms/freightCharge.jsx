/* eslint camelcase: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Checkbox, message } from 'antd';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import { computeSaleCharge, setConsignFields } from 'common/reducers/shipment';
import { getChargeAmountExpression } from '../../common/charge';
import messages from '../message.i18n';

const formatMsg = format(messages);
@connect(
  state => ({
    tenantId: state.account.tenantId,
    formData: state.shipment.formData,
  }),
  { computeSaleCharge, setConsignFields }
)
export default class FreightCharge extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    formData: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    computeSaleCharge: PropTypes.func.isRequired,
    setConsignFields: PropTypes.func.isRequired,
  }
  state = {
    computed: false,
    checkPickup: false,
    checkDeliver: false,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleCompute = () => {
    const {
      customer_partner_id, consigner_region_code, consignee_region_code,
      transport_mode_code,
    } = this.props.formData;
    const { goods_type, package: ctn, vehicle_type, vehicle_length, total_weight, total_volume } =
      this.props.formhoc.getFieldsValue([
        'goods_type', 'package', 'vehicle_type',
        'vehicle_length', 'total_weight', 'total_volume',
      ]);
    if (!(total_volume || total_weight || ctn || vehicle_length)) {
      message.error('运单数量如(总体积/总重量/集装箱包装类型)未填');
      return;
    }
    const created = this.props.formData.created_date || Date.now();
    this.props.computeSaleCharge({
      partner_id: customer_partner_id, consigner_region_code, consignee_region_code,
      goods_type, trans_mode: transport_mode_code, ctn,
      tenant_id: this.props.tenantId, created_date: created,
      vehicle_type, vehicle_length, total_weight, total_volume,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else if (result.data.freight === -1) {
        message.error('未找到适合计算的价格协议');
      } else if (result.data.freight === -2) {
        message.error('未找到对应路线的价格表');
      } else {
        // todo 起步价运费公式? pickup未勾选列表中如何不显示? 位数? pickup mode=1 x数量?
        const { freight, pickup, deliver, meter, quantity,
          unitRatio, gradient, miles, coefficient } = result.data;
        this.props.formhoc.setFieldsValue({
          freight_charge: freight,
          pickup_charge: pickup,
          deliver_charge: deliver,
          total_charge: Number(freight) + Number(pickup) + Number(deliver) + (
            this.props.formhoc.getFieldValue('surcharge') || this.props.formData.surcharge || 0
          ),
        });
        this.setState({
          computed: true,
          checkPickup: true,
          checkDeliver: true,
        });
        this.props.setConsignFields({
          charge_gradient: gradient,
          charge_amount: getChargeAmountExpression(meter, miles, quantity,
              unitRatio, coefficient),
        });
      }
    });
  }
  handlePickupCheck = (ev) => {
    this.setState({ checkPickup: ev.target.checked });
    const { formhoc } = this.props;
    if (ev.target.checked) {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          + formhoc.getFieldValue('pickup_charge'),
      });
    } else {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          - formhoc.getFieldValue('pickup_charge'),
      });
    }
  }
  handleDeliverCheck = (ev) => {
    this.setState({ checkDeliver: ev.target.checked });
    const { formhoc } = this.props;
    if (ev.target.checked) {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          + formhoc.getFieldValue('deliver_charge'),
      });
    } else {
      formhoc.setFieldsValue({
        total_charge: formhoc.getFieldValue('total_charge')
          - formhoc.getFieldValue('deliver_charge'),
      });
    }
  }
  handleSurchargeChange = (ev) => {
    const { formhoc } = this.props;
    const { checkPickup, checkDeliver } = this.state;
    let total = formhoc.getFieldValue('freight_charge');
    if (ev.target.value && !isNaN(Number(ev.target.value))) {
      total += Number(ev.target.value);
    }
    if (checkPickup) {
      total += formhoc.getFieldValue('pickup_charge');
    }
    if (checkDeliver) {
      total += formhoc.getFieldValue('deliver_charge');
    }
    formhoc.setFieldsValue({ total_charge: total });
  }
  handleReset = (ev) => {
    ev.preventDefault();
    this.setState({ computed: false });
    this.props.formhoc.setFieldsValue({
      freight_charge: undefined,
      pickup_charge: undefined,
      deliver_charge: undefined,
      surcharge: undefined,
      total_charge: undefined,
    });
    this.props.setConsignFields({
      charge_gradient: undefined,
      charge_amount: undefined,
    });
  }
  render() {
    const { formhoc, formData } = this.props;
    const { computed, checkPickup, checkDeliver } = this.state;
    return (
      <Card title={this.msg('freightCharge')} bodyStyle={{ padding: 16 }}
        extra={computed ? <a role="button" onClick={this.handleReset}>重置</a> : null}
      >
        <Button style={{ width: '100%', marginBottom: 16 }} type="primary" size="large" icon="calculator"
          onClick={this.handleCompute}
        >
          {this.msg('computeCharge')}
        </Button>
        {
          computed &&
          <InputItem formhoc={formhoc} labelName={this.msg('basicCharge')} addonAfter={this.msg('CNY')}
            field="freight_charge" fieldProps={{ initialValue: formData.freight_charge }}
            colSpan={8} readOnly
          />
        }
        {
          computed &&
          <InputItem formhoc={formhoc} addonAfter={this.msg('CNY')}
            labelName={<span>
              <Checkbox checked={checkPickup} onChange={this.handlePickupCheck} />
              {this.msg('pickupCharge')}
            </span>}
            field="pickup_charge" fieldProps={{ initialValue: formData.pickup_charge }}
            colSpan={8} readOnly colon={false}
          />
        }
        {
          computed &&
          <InputItem formhoc={formhoc} addonAfter={this.msg('CNY')}
            labelName={<span>
              <Checkbox checked={checkDeliver} onChange={this.handleDeliverCheck} />
              {this.msg('deliverCharge')}
            </span>}
            field="deliver_charge" fieldProps={{ initialValue: formData.deliver_charge }}
            colSpan={8} readOnly colon={false}
          />
        }
        {
          computed &&
          <InputItem formhoc={formhoc} labelName={this.msg('surcharge')} addonAfter={this.msg('CNY')}
            field="surcharge" fieldProps={{ initialValue: formData.surcharge,
              onChange: this.handleSurchargeChange }}
            colSpan={8}
          />
        }
        <InputItem formhoc={formhoc} labelName={this.msg('totalCharge')} addonAfter={this.msg('CNY')}
          field="total_charge" fieldProps={{ initialValue: formData.total_charge }}
          rules={[{ type: 'number', transform: v => Number(v),
            message: this.msg('totalChargeMustBeNumber') }]}
          colSpan={8} readOnly={computed}
        />
      </Card>
    );
  }
}
