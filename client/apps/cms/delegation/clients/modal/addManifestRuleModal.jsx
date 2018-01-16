import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message, Radio } from 'antd';
import { connect } from 'react-redux';
import { toggleBillTempModal, createBillTemplate } from 'common/reducers/cmsManifest';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  loginName: state.account.username,
  tenantName: state.account.tenantName,
  visible: state.cmsManifest.addTemplateModal.visible,
  operation: state.cmsManifest.addTemplateModal.operation,
}), { toggleBillTempModal, createBillTemplate })
@Form.create()
export default class AddManifestRuleModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // 'add' 'edit'
    customer: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    ietype: '',
  }
  handleOk = () => {
    const formData = {};
    const field = this.props.form.getFieldsValue();
    if (!field.template_name) {
      message.error('请填写规则名称');
    } else {
      const customer = this.props.customer;
      formData.customer_partner_id = customer.id;
      formData.customer_name = customer.name;
      formData.template_name = field.template_name;
      formData.i_e_type = field.i_e_type;
      this.handleAddNew(formData);
    }
  }
  handleAddNew = (formData) => {
    const {
      tenantId, loginId, loginName, tenantName,
    } = this.props;
    const params = {
      ...formData, tenant_id: tenantId, modify_id: loginId, modify_name: loginName, tenant_name: tenantName,
    };
    this.props.createBillTemplate(params).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.toggleBillTempModal(false, 'add', formData.template_name);
        this.context.router.push(`/clearance/${this.state.ietype}/manifest/rules/edit/${result.data.id}`);
      }
    });
  }
  handleCancel = () => {
    this.props.toggleBillTempModal(false);
  }
  handleIEChange = (ev) => {
    this.setState({
      ietype: ev.target.value === 0 ? 'import' : 'export',
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal maskClosable={false} title="新增制单规则" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="horizontal">
          <FormItem label="规则名称" {...formItemLayout}>
            {getFieldDecorator('template_name', {
              rules: [{ required: true, message: '规则名称必填' }],
            })(<Input />)}
          </FormItem>
          <FormItem label="进出口类型" {...formItemLayout}>
            {getFieldDecorator('i_e_type', {
              rules: [{ required: true, message: '进出口类型必选' }],
            })(<RadioGroup onChange={this.handleIEChange}>
              <Radio value={0}>进口</Radio>
              <Radio value={1}>出口</Radio>
            </RadioGroup>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
