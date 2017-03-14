import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Select, message } from 'antd';
import { createRepo, loadOwners } from 'common/reducers/cmsTradeitem';
import { closeAddModal } from 'common/reducers/cmsSettings';
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
    visibleAddModal: state.cmsSettings.visibleAddModal,
    customers: state.crmCustomers.customers,
    repoOwners: state.cmsTradeitem.repoOwners,
  }),
  { createRepo, closeAddModal, loadOwners }
)
@Form.create()
export default class customerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    visibleAddModal: PropTypes.bool.isRequired,
    customers: PropTypes.array.isRequired,
    repoOwners: PropTypes.array.isRequired,
  }
  state = {
    customerid: null,
  }
  handleCancel = () => {
    this.props.closeAddModal();
  }
  handleOk = () => {
    const customer = this.props.customers.filter(cust => cust.id === this.state.customerid)[0];
    this.props.createRepo({
      createrTenantId: this.props.tenantId,
      ownerPartnerId: customer.id,
      ownerTenantId: customer.partner_tenant_id,
      createrLoginId: this.props.loginId,
      uniqueCode: customer.partner_unique_code,
    }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadOwners({
            tenantId: this.props.tenantId,
          });
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
    const { form: { getFieldDecorator }, visibleAddModal, customers, repoOwners } = this.props;
    let newCustomers = customers;
    for (let i = 0; i < repoOwners.length; i++) {
      const owner = repoOwners[i];
      newCustomers = newCustomers.filter(ct => ct.id !== owner.id);
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

