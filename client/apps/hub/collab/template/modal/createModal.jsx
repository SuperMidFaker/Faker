import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Modal, Form, Input } from 'antd';
import { toggleTemplateModal, createTemplate } from 'common/reducers/template';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.template.templateModal.visible,
  }),
  { toggleTemplateModal, createTemplate }
)
@Form.create()
export default class CreateModal extends Component {
  handleCancel = () => {
    this.props.toggleTemplateModal(false);
  }
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.createTemplate(values).then(result => {
          if (!result.error) {
            
          }
        })
      }
    })
  }
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal width={600} title="创建通知模版" visible={visible} onOk={this.handleSubmit} onCancel={this.handleCancel}>
        <FormItem label="模版名称" {...formItemLayout}>
          {getFieldDecorator('name', {
            required: true,
          })(
            <Input/>
          )}
        </FormItem>
        <FormItem label="发送方" {...formItemLayout}>
          {getFieldDecorator('sender', )(
            <Input/>
          )}
        </FormItem>
        <FormItem label="标题" {...formItemLayout}>
          {getFieldDecorator('title', {
            required: true,
          })(
            <Input/>
          )}
        </FormItem>
      </Modal>
    )
  }
}