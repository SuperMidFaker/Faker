import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, DatePicker } from 'ant-ui';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import { isPositiveInteger } from 'common/validater';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default class ScheduleInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handlePickupChange = pickupDt => {
    const transitTime = this.props.formhoc.getFieldValue('transit_time') || 0;
    const deliverDate = new Date(
      pickupDt.getTime() + transitTime * ONE_DAY_MS
    );
    this.props.formhoc.setFieldsValue({
      'deliver_est_date': deliverDate,
    });
  }
  handleTransitChange = ev => {
    const pickupDt = this.props.formhoc.getFieldValue('pickup_est_date');
    if (pickupDt) {
      const deliverDate = new Date(
        pickupDt.getTime() + ev.target.value * ONE_DAY_MS
      );
      this.props.formhoc.setFieldsValue({
        'deliver_est_date': deliverDate,
      });
    }
  }
  handleDeliveryChange = deliverDt => {
    const transitTime = this.props.formhoc.getFieldValue('transit_time') || 0;
    const pickupDt = new Date(
      deliverDt.getTime() - transitTime * ONE_DAY_MS
    );
    this.props.formhoc.setFieldsValue({
      'pickup_est_date': pickupDt,
    });
  }
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
              'pickup_est_date', {
                onChange: this.handlePickupChange,
                rules: [{
                  required: true, message: this.msg('deliveryDateMust'), type: 'date'
                }]
              }
            )}
            />
          </FormItem>
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <InputItem type="number" labelName={this.msg('shipmtTransit')} colSpan={labelColSpan}
            addonAfter={this.msg('day')} formhoc={formhoc} field="transit_time"
            fieldProps={{ onChange: this.handleTransitChange }}
            hasFeedback={false} rules={[{
              validator: (rule, value, callback) => {
                if (value && !isPositiveInteger(value)) {
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
              'deliver_est_date', {
                onChange: this.handleDeliveryChange,
                rules: [{
                  required: true, message: this.msg('deliveryDateMust'), type: 'date'
                }]
              }
            )}
            />
          </FormItem>
        </Col>
      </Row>
    );
  }
}
