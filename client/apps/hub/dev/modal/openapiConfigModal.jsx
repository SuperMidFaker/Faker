import React, { Component } from 'react';
import { Select, Checkbox, Col, Modal, Input, Form, message } from 'antd';
import { connect } from 'react-redux';
import { toggleAppCreateModal, loadDevApps } from 'common/reducers/devApp';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.devApp.appCreateModal.visible,
    pageSize: state.devApp.apps.pageSize,
    current: state.devApp.apps.current,
  }),
  { toggleAppCreateModal, loadDevApps }
)
@Form.create()
export default class AppOpenapiModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleCancel = () => {
    this.props.toggleAppCreateModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((error, values) => {
      if (!error) {
        this.props.createApp(values.app_name).then((result) => {
          if (!result.error) {
            this.props.loadDevApps({
              pageSize: this.props.pageSize,
              current: this.props.current,
            });
            this.handleCancel();
          } else {
            message.error(result.error.message, 10);
          }
        });
      }
    });
  }
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="OPENAPI" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk} destroyOnClose>
        <Form layout="vertical">
          <FormItem {...formItemLayout}>
            {getFieldDecorator('orders_create', {
              valuePropName: 'checked',
            })(<Checkbox>订单创建接口</Checkbox>)}
          </FormItem>
          <Col span={12}>
            <FormItem {...formItemLayout} label="客户参数">
              {getFieldDecorator('orders_create.customer_partner_id', {
            })(<Select />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...formItemLayout} label="流程参数">
              {getFieldDecorator('orders_create.flow_id', {
              rules: [{ required: true }],
            })(<Select />)}
            </FormItem>
          </Col>
          <FormItem {...formItemLayout} label="授权Token">
            <Input readOnly />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

