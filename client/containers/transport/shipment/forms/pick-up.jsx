import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Select } from 'ant-ui';
import InputItem from './input-item';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
export default class PickupInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outerColSpan: PropTypes.number.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    formhoc: PropTypes.object.isRequired
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const {
      outerColSpan, labelColSpan, formhoc,
      formhoc: { getFieldError, getFieldProps }
    } = this.props;
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg('pickupInfo')}</div>
        </div>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('consignor')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} help={getFieldError('sender')} required
          >
            <Select defaultValue="aa" {...getFieldProps('sender', [{
              required: true, message: this.msg('consignorMessage')
            }])}
            >
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
          <InputItem formhoc={formhoc} labelName={this.msg('loadingPort')}
            field="loadingPort" colSpan={labelColSpan}
          />
        </Col>
        <Col span={`${24 - outerColSpan}`} className="subform-body">
          <InputItem formhoc={formhoc} labelName={this.msg('contact')}
            field="consignorContact" colSpan={labelColSpan}
          />
        </Col>
      </Row>
    );
  }
}
