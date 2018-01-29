import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, message, Menu } from 'antd';
import { toggleTemplateModal, createTemplate, updateTemplate } from 'common/reducers/template';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';

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
        <Menu.Item key="$业务编号">业务编号</Menu.Item>
        <Menu.Item key="$订单号">订单号</Menu.Item>
        <Menu.Item key="$发票号">发票号</Menu.Item>
        <Menu.Item key="$合同号">合同号</Menu.Item>
      </Menu>
    );
    const editorProps = {
      contentFormat: 'html',
      initialContent: record.content ? record.content : '',
      onHTMLChange: this.onHTMLChange,
      extendControls: [
        {
          type: 'dropdown',
          text: <span>下拉菜单</span>,
          component: menu,
        },
      ],
    };
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal width={800} title="创建通知模版" visible={visible} onOk={this.handleSubmit} onCancel={this.handleCancel}>
        <FormItem label="模版名称" {...formItemLayout}>
          {getFieldDecorator('name', {
            required: true,
            initialValue: record.name,
          })(<Input />)}
        </FormItem>
        <FormItem label="发送方" {...formItemLayout}>
          {getFieldDecorator('sender', {
            initialValue: record.sender,
          })(<Input />)}
        </FormItem>
        <FormItem label="标题" {...formItemLayout}>
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
