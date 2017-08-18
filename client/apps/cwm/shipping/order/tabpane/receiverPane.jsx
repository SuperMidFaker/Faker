/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Col, Row, Select, Input, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class ReceiverPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    soHead: PropTypes.object,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, soHead } = this.props;
    return (
      <div style={{ padding: 24 }}>
        <Row>
          <Col span={6}>
            <FormItem label="收货人名称">
              {getFieldDecorator('owner_partner_id', {
                rules: [{ required: true, message: 'Please select customer!' }],
                initialValue: soHead && soHead.receiver_name,
              })(
                <Select placeholder="选择收货人" onSelect={this.handleSelect} />
                )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="联系人">
              {getFieldDecorator('receiver_contact', {
                initialValue: soHead && soHead.receiver_contact,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="联系方式">
              <Col span={12}><Input prefix={<Icon type="phone" />} placeholder="电话" value={soHead && soHead.receiver_phone} /></Col>
              <Col span={12}><Input prefix={<Icon type="mobile" />} placeholder="手机" value={soHead && soHead.receiver_number} /></Col>
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
              {getFieldDecorator('receiver_address', {
                initialValue: soHead && soHead.receiver_address,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="邮政编码">
              {getFieldDecorator('receiver_post_code', {
                initialValue: soHead && soHead.receiver_post_code,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
