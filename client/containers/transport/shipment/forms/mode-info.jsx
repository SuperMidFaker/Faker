import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Select } from 'ant-ui';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

export default class ModeInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired
  }

  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const {
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
              'transit_mode', { rules: [{
                required: true, message: this.msg('transitModeMust')
              }]}
            )}
            >
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('vehicleType')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}}
          >
            <Select value="aa">
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('vehicleLength')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}}
          >
            <Select value="aa">
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
    );
  }
}
