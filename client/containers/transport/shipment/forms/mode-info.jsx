import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Select } from 'ant-ui';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@connect(
  state => ({
    transitModes: state.shipment.formRequire.transitModes,
    vehicleTypes: state.shipment.formRequire.vehicleTypes,
    vehicleLengths: state.shipment.formRequire.vehicleLengths
  })
)
export default class ModeInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    transitModes: PropTypes.array.isRequired,
    vehicleTypes: PropTypes.array.isRequired,
    vehicleLengths: PropTypes.array.isRequired,
    formhoc: PropTypes.object.isRequired
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const {
      transitModes, vehicleTypes, vehicleLengths,
      formhoc: { getFieldProps }
    } = this.props;
    const outerColSpan = 8;
    const labelColSpan = 6;
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg('transitModeInfo')}</div>
        </div>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('transitModeInfo')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} required
          >
            <Select {...getFieldProps(
              'transport_mode_code', { rules: [{
                required: true, message: this.msg('transitModeMust')
              }]}
            )}
            >
            {transitModes.map(
              tm => <Option value={tm.mode_code} key={tm.mode_code}>{tm.mode_name}</Option>
            )}
            </Select>
          </FormItem>
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('vehicleType')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}}
          >
            <Select {...getFieldProps('vehicle_type')}>
            {vehicleTypes.map(
              vt => <Option value={parseInt(vt.id, 10)} key={`${vt.name}${vt.id}`}>{vt.name}</Option>
            )}
            </Select>
          </FormItem>
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('vehicleLength')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}}
          >
            <Select {...getFieldProps('vehicle_length')}>
            {vehicleLengths.map(
              vl => <Option value={parseInt(vl.id, 10)} key={`${vl.name}${vl.id}`}>{vl.name}</Option>
            )}
            </Select>
          </FormItem>
        </Col>
      </Row>
    );
  }
}
