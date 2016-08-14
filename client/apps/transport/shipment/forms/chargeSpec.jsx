import React, { PropTypes } from 'react';
import { Form, Input, Checkbox } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class ChargeSpecForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    charge: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    checkPickup: true,
    checkDeliver: true,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handlePickupCheck = (ev) => {
    this.setState({ checkPickup: ev.target.checked });
    const { charge, index, onChange } = this.props;
    if (ev.target.checked) {
      onChange({
        ...charge, total_charge: charge.total_charge + charge.pickup_charge,
      }, index);
    } else {
      onChange({
        ...charge, total_charge: charge.total_charge - charge.pickup_charge,
      }, index);
    }
  }
  handleDeliverCheck = (ev) => {
    this.setState({ checkDeliver: ev.target.checked });
    const { charge, index, onChange } = this.props;
    if (ev.target.checked) {
      charge.total_charge += charge.deliver_charge;
    } else {
      charge.total_charge -= charge.deliver_charge;
    }
    onChange(charge, index);
  }
  handleSurchargeChange = (ev) => {
    const { checkPickup, checkDeliver } = this.state;
    const { charge, index } = this.props;
    let total = charge.freight_charge;
    let surcharge = charge.surcharge;
    if (ev.target.value) {
      surcharge = parseInt(ev.target.value, 10);
      total += surcharge;
    } else {
      surcharge = null;
    }
    if (checkPickup) {
      total += charge.pickup_charge;
    }
    if (checkDeliver) {
      total += charge.deliver_charge;
    }
    charge.total_charge = total;
    charge.surcharge = surcharge;
    this.props.onChange(charge, index);
  }
  render() {
    const { charge } = this.props;
    const { checkPickup, checkDeliver } = this.state;
    const span = 6;
    return (
      <Form horizontal>
        <FormItem label={this.msg('basicCharge')} labelCol={{ span }} wrapperCol={{ span: 24 - span }}>
          <Input addonAfter={this.msg('CNY')} readOnly defaultValue={charge.freight_charge} />
        </FormItem>
        <FormItem label={
          <span>
            <Checkbox checked={checkPickup} onChange={this.handlePickupCheck} />
            {this.msg('pickupCharge')}
          </span>
        } labelCol={{ span }} wrapperCol={{ span: 24 - span }}
        >
          <Input addonAfter={this.msg('CNY')} readOnly defaultValue={charge.pickup_charge} />
        </FormItem>
        <FormItem label={<span>
          <Checkbox checked={checkDeliver} onChange={this.handleDeliverCheck} />
          {this.msg('deliverCharge')}
          </span>} labelCol={{ span }} wrapperCol={{ span: 24 - span }}
        >
          <Input addonAfter={this.msg('CNY')} readOnly defaultValue={charge.deliver_charge} />
        </FormItem>
        <FormItem label={this.msg('surcharge')} labelCol={{ span: 4 }}
          wrapperCol={{ span: 24 - span }}
        >
          <Input addonAfter={this.msg('CNY')} value={charge.surcharge}
            onChange={this.handleSurchargeChange}
          />
        </FormItem>
      </Form>
    );
  }
}

