import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Select, message } from 'antd';
import { closeAddModal, addRelatedCusromer, loadRelatedCustomers } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visibleAddModal: state.cmsManifest.visibleAddModal,
    customers: state.crmCustomers.customers,
    template: state.cmsManifest.template,
    relatedCustomers: state.cmsManifest.relatedCustomers,
  }),
  { addRelatedCusromer, closeAddModal, loadRelatedCustomers }
)
@Form.create()
export default class customerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    visibleAddModal: PropTypes.bool.isRequired,
    customers: PropTypes.array.isRequired,
    template: PropTypes.object,
    relatedCustomers: PropTypes.array.isRequired,
  }
  state = {
    customerid: null,
  }
  handleCancel = () => {
    this.props.closeAddModal();
  }
  handleOk = () => {
    const customer = this.props.customers.filter(cust => cust.id === this.state.customerid)[0];
    this.props.addRelatedCusromer({
      template_id: this.props.template.id,
      tenant_id: this.props.tenantId,
      customer_name: customer.name,
      customer_partner_id: customer.id,
      customer_tenant_id: customer.partner_tenant_id,
    }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadRelatedCustomers(this.props.template.id);
          this.props.closeAddModal();
          this.props.form.resetFields();
        }
      });
  }
  handleSelectChange = (value) => {
    this.setState({ customerid: value });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { form: { getFieldDecorator }, visibleAddModal, customers, relatedCustomers } = this.props;
    let newCustomers = customers;
    for (let i = 0; i < relatedCustomers.length; i++) {
      const rel = relatedCustomers[i];
      newCustomers = newCustomers.filter(ct => ct.id !== rel.customer_partner_id);
    }
    return (
      <Modal title={this.msg('addRelatedCustomers')} visible={visibleAddModal}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label={this.msg('relatedCustomers')} {...formItemLayout}>
            {getFieldDecorator('customs', { initialValue: null }
                  )(<Select
                    showSearch
                    placeholder="选择客户"
                    optionFilterProp="children"
                    size="large"
                    onChange={this.handleSelectChange}
                  >
                    {newCustomers.map(data => (<Option key={data.id} value={data.id}
                      search={`${data.partner_code}${data.name}`}
                    >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                    )}
                  </Select>)
                }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

