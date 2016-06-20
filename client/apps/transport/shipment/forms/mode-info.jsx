import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Select } from 'ant-ui';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import { setConsignFields } from 'common/reducers/shipment';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@connect(
  state => ({
    transitModes: state.shipment.formRequire.transitModes,
    vehicleTypes: state.shipment.formRequire.vehicleTypes,
    vehicleLengths: state.shipment.formRequire.vehicleLengths,
    fieldDefaults: {
      vehicle_type: state.shipment.formData.vehicle_type,
      vehicle_length: state.shipment.formData.vehicle_length,
      container_no: state.shipment.formData.container_no,
      transport_mode_code: state.shipment.formData.transport_mode_code,
      package: state.shipment.formData.package,
    },
  }),
  { setConsignFields }
)
export default class ModeInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    transitModes: PropTypes.array.isRequired,
    vehicleTypes: PropTypes.array.isRequired,
    vehicleLengths: PropTypes.array.isRequired,
    fieldDefaults: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    setConsignFields: PropTypes.func.isRequired,
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleModeChange = (code) => {
    const modes = this.props.transitModes.filter(tm => tm.mode_code === code);
    let pack = this.props.fieldDefaults.package;
    if (code === 'CTN') {
      // 集装箱去除原来包装方式
      pack = '';
    }
    this.props.setConsignFields({
      transport_mode_code: code,
      transport_mode: modes.length > 0 ? modes[0].mode_name : '',
      package: pack,
    });
  }
  render() {
    const {
      transitModes, vehicleTypes, vehicleLengths,
      formhoc: { getFieldProps },
      fieldDefaults: { vehicle_type, vehicle_length, container_no, transport_mode_code: tmc }
    } = this.props;
    let outerColSpan = 24;
    let labelColSpan = 2;
    const modeCode = tmc;
    const modeEditCols = [];
    if (modeCode === 'FTL') {
      // 整车,修改车型,车长
      outerColSpan = 8;
      labelColSpan = 8;
      modeEditCols.push(
        <Col key="vehicle_type" span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('vehicleType')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}}
          >
            <Select {...getFieldProps('vehicle_type', { initialValue: vehicle_type })}>
            {vehicleTypes.map(
              vt => <Option value={vt.value} key={`${vt.text}${vt.value}`}>{vt.text}</Option>
            )}
            </Select>
          </FormItem>
        </Col>,
        <Col key="vehicle_length" span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('vehicleLength')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}}
          >
            <Select {...getFieldProps('vehicle_length', { initialValue: vehicle_length })}>
            {vehicleLengths.map(
              vl => <Option value={vl.value} key={`${vl.text}${vl.value}`}>{vl.text}</Option>
            )}
            </Select>
          </FormItem>
        </Col>
      );
    } else if (modeCode === 'CTN') {
      // 集装箱,修改箱号
      outerColSpan = 8;
      labelColSpan = 8;
      modeEditCols.push(
        <Col key="container_no" span={`${outerColSpan}`} className="subform-body">
          <InputItem labelName={this.msg('containerNo')} field="container_no"
          colSpan={labelColSpan} formhoc={this.props.formhoc}
          fieldProps={{ initialValue: container_no }}
          />
        </Col>,
        <Col span={`${outerColSpan}`} className="subform-body" />
      );
    } else {
      outerColSpan = 8;
      labelColSpan = 8;
      modeEditCols.push(
        <Col span={`${outerColSpan}`} className="subform-body" />,
        <Col span={`${outerColSpan}`} className="subform-body" />
      );
    }
    return (
      <Row>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('transitModeInfo')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} required
          >
            <Select {...getFieldProps(
              'transport_mode_code', {
                rules: [{
                  required: true, message: this.msg('transitModeMust')
                }],
                initialValue: tmc,
                onChange: this.handleModeChange,
              }
            )}
            >
            {transitModes.map(
              tm => <Option value={tm.mode_code} key={tm.mode_code}>{tm.mode_name}</Option>
            )}
            </Select>
          </FormItem>
        </Col>
        { modeEditCols }
      </Row>
    );
  }
}
