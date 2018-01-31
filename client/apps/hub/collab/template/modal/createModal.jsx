import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, message, Menu } from 'antd';
import { toggleTemplateModal, createTemplate, updateTemplate } from 'common/reducers/template';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.template.templateModal.visible,
    record: state.template.templateModal.record,
  }),
  { toggleTemplateModal, createTemplate, updateTemplate }
)
@Form.create()
export default class CreateModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    content: '',
  }
  componentWillReceiveProps(nexrProps) {
    if (nexrProps.visible !== this.props.visible && nexrProps.visible) {
      this.setState({
        content: nexrProps.record.content,
      });
      if (this.editorInstance) {
        if (nexrProps.record.content) {
          this.editorInstance.setContent(nexrProps.record.content);
        } else {
          this.editorInstance.setContent('');
        }
      }
    }
  }
  onHTMLChange = (html) => {
    this.setState({
      content: html,
    });
  }
  msg = formatMsg(this.props.intl);
  handleSubmit = () => {
    if (!this.state.content) {
      message.error('内容不能为空');
      return;
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { record } = this.props;
        if (record.id) {
          this.props.updateTemplate({
            ...values,
            content: this.state.content,
            id: record.id,
          }).then((result) => {
            if (!result.error) {
              this.handleCancel();
              this.props.reload();
            }
          });
        } else {
          this.props.createTemplate({ ...values, content: this.state.content }).then((result) => {
            if (!result.error) {
              this.handleCancel();
              this.props.reload();
            }
          });
        }
      }
    });
  }
  handleCancel = () => {
    this.props.toggleTemplateModal(false);
  }
  handleMenuClick = ({ key }) => {
    const { content } = this.state;
    this.setState({
      content: `${content}<span>${key}</span>`,
    });
    this.editorInstance.setContent(`${content}<span>${key}</span>`);
  }
  init = (instance) => {
    this.editorInstance = instance;
  }
  render() {
    const { visible, form: { getFieldDecorator }, record } = this.props;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="$业务编号">{this.msg('shipmtOrderNo')}</Menu.Item>
        <Menu.Item key="$订单号">{this.msg('custOrderNo')}</Menu.Item>
        <Menu.Item key="$发票号">{this.msg('invoiceNo')}</Menu.Item>
        <Menu.Item key="$合同号">{this.msg('contractNo')}</Menu.Item>
      </Menu>
    );
    const editorProps = {
      contentFormat: 'html',
      initialContent: record.content ? record.content : '',
      onHTMLChange: this.onHTMLChange,
      extendControls: [
        {
          type: 'dropdown',
          text: <span>{this.msg('dropdown')}</span>,
          component: menu,
        },
      ],
    };
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal width={800} style={{ top: 24 }} title={this.msg('create')} visible={visible} onOk={this.handleSubmit} onCancel={this.handleCancel}>
        <FormItem label={this.msg('templateName')} {...formItemLayout}>
          {getFieldDecorator('name', {
            required: true,
            initialValue: record.name,
          })(<Input />)}
        </FormItem>
        <FormItem label={this.msg('sender')} {...formItemLayout}>
          {getFieldDecorator('sender', {
            initialValue: record.sender,
          })(<Input />)}
        </FormItem>
        <FormItem label={this.msg('title')} {...formItemLayout}>
          {getFieldDecorator('title', {
            required: true,
            initialValue: record.title,
          })(<Input />)}
        </FormItem>
        <BraftEditor {...editorProps} ref={instance => this.init(instance)} />
      </Modal>
    );
  }
}
