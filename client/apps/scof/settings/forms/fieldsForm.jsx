import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Input, Col, Icon, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateEasipassApp } from 'common/reducers/openIntegration';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    app: state.openIntegration.easipassApp,
  }),
  { updateEasipassApp }
)
@Form.create()
export default class FieldsForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {

  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    return (
      <Form layout="horizontal">
        <FormItem label={this.msg('extField1')} {...formItemLayout}>
          <Col span={16}>
            <FormItem>
              <Input placeholder="显示名称" addonBefore={<Icon type="form" />} />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Switch checkedChildren="启用" unCheckedChildren="关闭" />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              <Switch checkedChildren="必填" unCheckedChildren="可选" />
            </FormItem>
          </Col>
        </FormItem>
        <FormItem label={this.msg('extField2')} {...formItemLayout}>
          <Col span={16}>
            <FormItem>
              <Input placeholder="显示名称" addonBefore={<Icon type="form" />} />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Switch checkedChildren="启用" unCheckedChildren="关闭" />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              <Switch checkedChildren="必填" unCheckedChildren="可选" />
            </FormItem>
          </Col>
        </FormItem>
        <FormItem label={this.msg('extField3')} {...formItemLayout}>
          <Col span={16}>
            <FormItem>
              <Input placeholder="显示名称" addonBefore={<Icon type="form" />} />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Switch checkedChildren="启用" unCheckedChildren="关闭" />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              <Switch checkedChildren="必填" unCheckedChildren="可选" />
            </FormItem>
          </Col>
        </FormItem>
        <FormItem label={this.msg('extField4')} {...formItemLayout}>
          <Col span={16}>
            <FormItem>
              <Input placeholder="显示名称" addonBefore={<Icon type="form" />} />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Switch checkedChildren="启用" unCheckedChildren="关闭" />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              <Switch checkedChildren="必填" unCheckedChildren="可选" />
            </FormItem>
          </Col>
        </FormItem>
        <FormItem label={this.msg('extField5')} {...formItemLayout}>
          <Col span={16}>
            <FormItem>
              <Input placeholder="显示名称" addonBefore={<Icon type="calendar" />} />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Switch checkedChildren="启用" unCheckedChildren="关闭" />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              <Switch checkedChildren="必填" unCheckedChildren="可选" />
            </FormItem>
          </Col>
        </FormItem>
        <FormItem label={this.msg('extField6')} {...formItemLayout}>
          <Col span={16}>
            <FormItem>
              <Input placeholder="显示名称" addonBefore={<Icon type="calendar" />} />
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <FormItem>
              <Switch checkedChildren="启用" unCheckedChildren="关闭" />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              <Switch checkedChildren="必填" unCheckedChildren="可选" />
            </FormItem>
          </Col>
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
      </Form>
    );
  }
}
