import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { toggleInvTempModal, createInvTemplate } from 'common/reducers/cmsInvoice';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginName: state.account.username,
  visible: state.cmsInvoice.invTemplateModal.visible,
}), { toggleInvTempModal, createInvTemplate })
@Form.create()
export default class InvTemplateModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    visible: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleOk = () => {
    const field = this.props.form.getFieldsValue();
    if (field.template_name === '') {
      message.error('请填写模板名称');
    } else {
      this.handleAddNew({ template_name: field.template_name });
    }
  }
  handleAddNew = (formData) => {
    const { tenantId, loginName } = this.props;
    const params = { ...formData, tenant_id: tenantId, modify_name: loginName };
    this.props.createInvTemplate(params).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.toggleInvTempModal(false, formData.template_name);
        this.context.router.push(`/clearance/settings/invoicetemplates/edit/${result.data.id}`);
      }
    });
  }
  handleCancel = () => {
    this.props.toggleInvTempModal(false);
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal title="新增模板" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem label="模板名称:" {...formItemLayout} >
          {getFieldDecorator('template_name', {
            rules: [{ required: true, message: '模板名称必填' }],
          })(
            <Input />
          )}
        </FormItem>
      </Modal>
    );
  }
}
