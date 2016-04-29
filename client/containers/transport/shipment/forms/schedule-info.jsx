import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, DatePicker } from 'ant-ui';
import InputItem from './input-item';
import { format } from 'universal/i18n/helpers';
import { isPositiveInteger } from 'reusable/common/validater';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

export default class ScheduleInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const { formhoc, formhoc: { getFieldProps } } = this.props;
    const outerColSpan = 8;
    const labelColSpan = 6;
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg('scheduleInfo')}</div>
        </div>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('pickupDate')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} required
          >
            <DatePicker {...getFieldProps(
              'pickup_est_date', { rules: [{
                required: true, message: this.msg('deliveryDateMust'), type: 'date'
              }]}
            )}
            />
          </FormItem>
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <InputItem type="number" labelName={this.msg('shipmtTransit')} colSpan={labelColSpan}
            addonAfter={this.msg('day')} formhoc={formhoc} field="transit_time"
            hasFeedback={false} rules={[{
              validator: (rule, value, callback) => {
                if (isPositiveInteger(value)) {
                  callback(new Error(this.msg('timeMustBePositive')));
                } else {
                  callback();
                }
              }
            }]}
          />
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('deliveryDate')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} required
          >
            <DatePicker {...getFieldProps(
              'deliver_est_date', { rules: [{
                required: true, message: this.msg('deliveryDateMust'), type: 'date'
              }]}
            )} />
          </FormItem>
        </Col>
      </Row>
    );
  }
}
