/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Col, Row, Select, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class ReceiverForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div style={{ padding: 24 }}>
        <Row>
          <Col span={6}>
            <FormItem label="收货人名称">
              {getFieldDecorator('owner_partner_id', {
                rules: [{ required: true, message: 'Please select customer!' }],

              })(
                <Select placeholder="选择收货人" onSelect={this.handleSelect} />
                )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="联系人">
              <Input />
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="联系方式">
              <Col span={12}><Input placeholder="电话" /></Col>
              <Col span={12}><Input placeholder="手机" /></Col>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="省/市/县区">
              <Input />
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="详细地址">
              <Input />
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="邮政编码">
              <Input />
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
