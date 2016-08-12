/* eslint camelcase: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Checkbox, message } from 'antd';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import { computeCharge, setConsignFields } from 'common/reducers/shipment';
import { TARIFF_METER_METHODS } from 'common/constants';
import messages from '../message.i18n';

const formatMsg = format(messages);
@connect(
  state => ({
    tenantId: state.account.tenantId,
    formData: state.shipment.formData,
  }),
  { computeCharge, setConsignFields }
)
export default class FreightCharge extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    formData: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    computeCharge: PropTypes.func.isRequired,
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
    }
    const created = this.props.formData.created_date || Date.now();
    this.props.computeCharge({
      partner_id: customer_partner_id, consigner_region_code, consignee_region_code,
      goods_type, trans_mode: transport_mode_code, ctn,
      tenant_id: this.props.tenantId, created_date: created,
      vehicle_type, vehicle_length, total_weight, total_volume, type: 'sales',
    }).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else if (result.data.freight === -1) {
        message.error('价格协议不存在');
      } else {
        this.props.formhoc.setFieldsValue({
          freight_charge: result.data.freight,
          pickup_charge: result.data.pickup,
          deliver_charge: result.data.deliver,
          total_charge: result.data.freight + result.data.pickup + result.data.deliver,
        });
        this.setState({
          computed: true,
          checkPickup: true,
          checkDeliver: true,
        });
        const { meter, quantity, unitRatio, gradient, miles } = result.data;
        const amounts = [];
        if (meter === TARIFF_METER_METHODS[3].value) {
          amounts.push(`x${miles}公里`);
        }
        if (quantity) {
          if (meter === TARIFF_METER_METHODS[2].value) {
            amounts.push(`x${quantity}${this.msg('cubicMeter')}`);
          } else {
            amounts.push(`x${quantity}${this.msg('kilogram')}`);
          }
        }
        if (unitRatio !== 1) {
          amounts.push(`x${unitRatio}`);
        }
        this.props.setConsignFields({
          charge_gradient: gradient,
          charge_amount: amounts.join(''),
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
    if (ev.target.value) {
      total += parseInt(ev.target.value, 10);
    }
    if (checkPickup) {
      total += formhoc.getFieldValue('pickup_charge');
    }
    if (checkDeliver) {
      total += formhoc.getFieldValue('deliver_charge');
    }
    formhoc.setFieldsValue({ total_charge: total });
  }
  render() {
    const { formhoc, formData } = this.props;
    const { computed, checkPickup, checkDeliver } = this.state;
    return (
      <Card title={this.msg('freightCharge')} bodyStyle={{ padding: 16 }}>
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
          colSpan={8} readOnly={computed}
        />
      </Card>
    );
  }
}
