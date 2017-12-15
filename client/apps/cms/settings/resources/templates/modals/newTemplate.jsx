import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message, Radio } from 'antd';
import { connect } from 'react-redux';
import { toggleInvTempModal, createInvTemplate } from 'common/reducers/cmsInvoice';
import { CMS_DOCU_TYPE } from 'common/constants';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginName: state.account.username,
  visible: state.cmsInvoice.invTemplateModal.visible,
  docuType: state.cmsInvoice.docuType,
}), { toggleInvTempModal, createInvTemplate })
@Form.create()
export default class InvTemplateModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    docuType: PropTypes.number.isRequired,
    customer: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleOk = () => {
    const field = this.props.form.getFieldsValue();
    if (field.template_name === '' || field.docu_type === '') {
      message.error('请填写完整信息');
    } else {
      this.handleAddNew(field);
    }
  }
  handleAddNew = (formData) => {
    const { tenantId, loginName, customer } = this.props;
    const params = {
      ...formData, tenant_id: tenantId, modify_name: loginName, customer_name: customer.name, customer_partner_id: customer.id,
    };
    this.props.createInvTemplate(params).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.toggleInvTempModal(false, formData.template_name);
        let type = '';
        if (formData.docu_type === CMS_DOCU_TYPE.invoice) {
          type = 'invoice';
        } else if (formData.docu_type === CMS_DOCU_TYPE.contract) {
          type = 'contract';
        } else if (formData.docu_type === CMS_DOCU_TYPE.packingList) {
          type = 'packinglist';
        }
        this.context.router.push(`/clearance/settings/resources/templates/${type}/${result.data.id}`);
      }
    });
  }
  handleCancel = () => {
    this.props.toggleInvTempModal(false);
  }
  render() {
    const { form: { getFieldDecorator }, visible, docuType } = this.props;
    return (
      <Modal maskClosable={false} title="新增单据模板" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem label="单据类型:" {...formItemLayout} >
          {getFieldDecorator('docu_type', {
            initialValue: docuType,
            rules: [{ required: true, message: '模板名称必填' }],
          })(<RadioGroup>
            <Radio value={0}>发票</Radio>
            <Radio value={1}>合同</Radio>
            <Radio value={2}>箱单</Radio>
          </RadioGroup>)}
        </FormItem>
        <FormItem label="模板名称:" {...formItemLayout} >
          {getFieldDecorator('template_name', {
            rules: [{ required: true, message: '模板名称必填' }],
          })(<Input />)}
        </FormItem>
      </Modal>
    );
  }
}
