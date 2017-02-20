/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Card, Col, Row, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
export default class SiderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col sm={24}>
              <FormItem label={this.msg('type')}>
                {getFieldDecorator('product_type', {
                })(
                  <Select combobox
                    optionFilterProp="search"
                    placeholder="选择类型"
                  >
                    <Option value="Ballo">Ballo</Option>
                    <Option value="CPU">CPU</Option>
                    <Option value="Float">Float</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('unitPrice')} >
                {getFieldDecorator('unit_price', {
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
