import React, { PropTypes } from 'react';
import { Modal, Form, Input, message, Radio } from 'antd';
import { connect } from 'react-redux';
import { toggleBillTempModal, createBillTemplate } from 'common/reducers/cmsSettings';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  loginName: state.account.username,
  visible: state.cmsSettings.billTemplateModal.visible,
  operation: state.cmsSettings.billTemplateModal.operation,
  partners: state.partner.partners,
}), { toggleBillTempModal, createBillTemplate })
@Form.create()
export default class BillTemplateModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // 'add' 'edit'
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleOk = () => {
    const formData = {};
    const field = this.props.form.getFieldsValue();
    if (field.template_name === '') {
      message.error('请填写模板名称');
    } else {
      formData.template_name = field.template_name;
      formData.i_e_type = field.i_e_type;
      this.handleAddNew(formData);
    }
  }
  handleAddNew = (formData) => {
    const { tenantId, loginId, loginName } = this.props;
    const params = { ...formData, tenant_id: tenantId, modify_id: loginId, modify_name: loginName };
    this.props.createBillTemplate(params).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.toggleBillTempModal(false, 'add', formData.template_name);
        this.context.router.push(`/clearance/settings/billtemplates/edit/${result.data.id}`);
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
        <FormItem label="进出口:" {...formItemLayout}>
          {getFieldDecorator('i_e_type', { initialValue: 0 })(
            <RadioGroup>
              <RadioButton value={0}>进口</RadioButton>
              <RadioButton value={1}>出口</RadioButton>
            </RadioGroup>)}
        </FormItem>
      </Modal>
    );
  }
}
