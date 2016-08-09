import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Checkbox, message } from 'antd';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import { computeCharge } from 'common/reducers/shipment';
import messages from '../message.i18n';

const formatMsg = format(messages);
@connect(
  state => ({
    tenantId: state.account.tenantId,
    formData: state.shipment.formData,
  }),
  { computeCharge }
)
export default class FreightCharge extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    formData: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    computeCharge: PropTypes.func.isRequired,
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
    const { goods_type, container_no, vehicle_type, vehicle_length, total_weight, total_volume } =
      this.props.formhoc.getFieldsValue([
        'goods_type', 'container_no', 'vehicle_type',
        'vehicle_length', 'total_weight', 'total_volume',
      ]);
    const created = this.props.formData.created_date || Date.now();
    this.props.computeCharge({
      partner_id: customer_partner_id, consigner_region_code, consignee_region_code,
      goods_type, trans_mode: transport_mode_code, ctn: container_no,
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
        this.setState({ computed: true });
      }
    });
  }
  render() {
    const { formhoc, formData } = this.props;
    const { computed, checkPickup, checkDeliver } = this.state;
    return (
      <Card title={this.msg('freightCharge')} bodyStyle={{ padding: 16 }}>
        <Button style={{ width: '100%', height: 37, marginBottom: 10 }} type="primary"
          onClick={this.handleCompute}
        >
          {this.msg('computeCharge')}
        </Button>
        {
          computed &&
          <InputItem formhoc={formhoc} labelName={this.msg('basicCharge')} addonAfter={this.msg('CNY')}
            field="freight_charge" fieldProps={{ initialValue: formData.freight_charge }}
            colSpan={4} readOnly
          />
        }
        {
          computed &&
          <InputItem formhoc={formhoc} addonAfter={this.msg('CNY')}
            labelName={<Checkbox checked={checkPickup}>{this.msg('pickupCharge')}</Checkbox>}
            field="pickup_charge" fieldProps={{ initialValue: formData.pickup_charge }}
            colSpan={4} readOnly colon={false}
          />
        }
        {
          computed &&
          <InputItem formhoc={formhoc} addonAfter={this.msg('CNY')}
            labelName={<Checkbox checked={checkDeliver}>{this.msg('deliverCharge')}</Checkbox>}
            field="deliver_charge" fieldProps={{ initialValue: formData.deliver_charge }}
            colSpan={4} readOnly colon={false}
          />
        }
        {
          computed &&
          <InputItem formhoc={formhoc} labelName={this.msg('surcharge')} addonAfter={this.msg('CNY')}
            field="surcharge" fieldProps={{ initialValue: formData.surcharge }}
            colSpan={4}
          />
        }
        <InputItem formhoc={formhoc} labelName={this.msg('totalCharge')} addonAfter={this.msg('CNY')}
          field="total_charge" fieldProps={{ initialValue: formData.total_charge }}
          colSpan={4} readOnly={computed}
        />
      </Card>
    );
  }
}
