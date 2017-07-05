import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, message, Select } from 'antd';
import { connect } from 'react-redux';
import { toggleBillTempModal, createBillTemplate } from 'common/reducers/cmsManifest';

const FormItem = Form.Item;
const Option = Select.Option;

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
  customers: state.crmCustomers.customers,
}), { toggleBillTempModal, createBillTemplate })
@Form.create()
export default class AddTemplateModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // 'add' 'edit'
    customers: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleOk = () => {
    const formData = {};
    const field = this.props.form.getFieldsValue();
    const ietype = this.props.ietype;
    if (!field.template_name) {
      message.error('请填写模板名称');
    } else if (!field.customer) {
      message.error('请选择关联客户');
    } else {
      const customer = this.props.customers.filter(cust => cust.id === field.customer)[0];
      formData.customer_partner_id = customer.id;
      formData.customer_name = customer.name;
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
    const { form: { getFieldDecorator }, visible, customers } = this.props;
    return (
      <Modal title="新增模板" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <FormItem label="关联客户" {...formItemLayout}>
          {getFieldDecorator('customer', { initialValue: null, rules: [{ required: true, message: '关联客户必选' }] }
          )(<Select
            showSearch
            placeholder="选择客户"
            optionFilterProp="children"
            size="large"
            style={{ width: '100%' }}
          >
            {customers.map(data => (<Option key={data.id} value={data.id}
              search={`${data.partner_code}${data.name}`}
            >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
            )}
          </Select>)
        }
        </FormItem>
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
