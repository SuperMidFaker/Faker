/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Col, Row, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadCarriers } from 'common/reducers/cwmWarehouse';
import { DELIVER_TYPES } from 'common/constants/cwm';
import { COURIERS } from 'common/constants/transport';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    carriers: state.cwmWarehouse.carriers,
  }),
  { loadCarriers }
)
export default class CarrierPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    soHead: PropTypes.object,
    editable: PropTypes.bool,
    selectedOwner: PropTypes.number.isRequired,
    onCarrierChange: PropTypes.func.isRequired,
  }
  componentWillMount() {
    this.props.loadCarriers(this.props.defaultWhse.code, this.props.defaultWhse.wh_ent_tenant_id);
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCarrierChange = (value) => {
    const { carriers, selectedOwner, form } = this.props;
    const deliverType = form.getFieldValue('delivery_type');
    let carrier;
    if (deliverType !== 3) {
      carrier = carriers.filter(item => item.owner_partner_id === selectedOwner).find(item => item.code === value);
    } else {
      carrier = COURIERS.find(item => item.code === value);
    }
    if (carrier) {
      this.props.onCarrierChange(carrier.name);
    }
  }
  handleDeliverTypeChange = (value) => {
    const deliverType = this.props.form.getFieldValue('delivery_type');
    if (deliverType && ((deliverType !== 3 && value === 3) || (deliverType === 3 && value !== 3))) {
      this.props.form.setFieldsValue({
        carrier_code: '',
      });
    }
  }
  render() {
    const { form: { getFieldDecorator }, soHead, carriers, selectedOwner } = this.props;
    const deliverType = this.props.form.getFieldValue('delivery_type');
    let crs;
    if (deliverType !== 3) {
      crs = carriers.filter(item => item.owner_partner_id === selectedOwner);
    } else {
      crs = COURIERS;
    }
    return (
      <div style={{ padding: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <FormItem label="配送方式" >
              {getFieldDecorator('delivery_type', {
                initialValue: soHead && soHead.delivery_type,
              })(
                <Select placeholder="选择配送方式" onChange={this.handleDeliverTypeChange}>
                  {DELIVER_TYPES.map(item => (<Option value={item.value}>{item.name}</Option>))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="承运人" >
              {getFieldDecorator('carrier_code', {
                rules: [{ message: 'Please select customer!' }],
                initialValue: soHead && soHead.carrier_code,
              })(
                (<Select placeholder="选择承运人" onChange={this.handleCarrierChange}>
                  {crs.map(item => (<Option value={item.code}>{item.name}</Option>))}
                </Select>)
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
