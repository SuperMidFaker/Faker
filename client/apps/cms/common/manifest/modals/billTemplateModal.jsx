import React, { PropTypes } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'react-redux';
import { toggleBillTempModal, createBillTemplate } from 'common/reducers/cmsManifest';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  loginName: state.account.username,
  tenantName: state.account.tenantName,
  visible: state.cmsManifest.billTemplateModal.visible,
  operation: state.cmsManifest.billTemplateModal.operation,
  partners: state.partner.partners,
}), { toggleBillTempModal, createBillTemplate })
@Form.create()
export default class BillTemplateModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // 'add' 'edit'
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleOk = () => {
    const formData = {};
    const field = this.props.form.getFieldsValue();
    const ietype = this.props.ietype;
    if (field.template_name === '') {
      message.error('请填写模板名称');
    } else {
      formData.template_name = field.template_name;
      formData.i_e_type = ietype === 'import' ? 0 : 1;
      this.handleAddNew(formData);
    }
  }
  handleAddNew = (formData) => {
    const { tenantId, loginId, loginName, tenantName } = this.props;
    const params = { ...formData, tenant_id: tenantId, modify_id: loginId, modify_name: loginName, tenant_name: tenantName };
    this.props.createBillTemplate(params).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.toggleBillTempModal(false, 'add', formData.template_name);
        this.context.router.push(`/clearance/${this.props.ietype}/manifest/billtemplates/edit/${result.data.id}`);
      }
    });
  }
  handleCancel = () => {
    this.props.toggleBillTempModal(false);
  }
  render() {
    const { form: { getFieldDecorator }, visible, operation } = this.props;
    return (
      <Modal title={operation === 'add' ? '新增模板' : '修改模板'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
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
