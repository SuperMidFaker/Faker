import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Select, message } from 'antd';
import { createRepo, closeAddModal, loadRepos } from 'common/reducers/cmsTradeitem';

import { formatMsg } from '../../message.i18n';


const { Option } = Select;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    visibleAddModal: state.cmsTradeitem.visibleAddModal,
    customers: state.crmCustomers.customers,
    repos: state.cmsTradeitem.repos,
  }),
  { createRepo, closeAddModal, loadRepos }
)
@Form.create()
export default class AddTradeRepoModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    visibleAddModal: PropTypes.bool.isRequired,
    customers: PropTypes.array.isRequired,
    repos: PropTypes.array.isRequired,
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
      ownerName: customer.name,
      tenantName: this.props.tenantName,
      createrLoginId: this.props.loginId,
      uniqueCode: customer.partner_unique_code,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadRepos({
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
  msg = formatMsg(this.props.intl)
  render() {
    const {
      form: { getFieldDecorator }, visibleAddModal, customers, repos,
    } = this.props;
    let newCustomers = customers;
    for (let i = 0; i < repos.length; i++) {
      const owner = repos[i];
      newCustomers = newCustomers.filter(ct => ct.id !== owner.owner_partner_id);
    }
    return (
      <Modal
        maskClosable={false}
        title={this.msg('addRepo')}
        visible={visibleAddModal}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label={this.msg('repoOwner')} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('customs')(<Select
              showSearch
              placeholder="选择客户"
              optionFilterProp="children"
              onChange={this.handleSelectChange}
            >
              {newCustomers.map(data => (<Option
                key={data.id}
                value={data.id}
                search={`${data.partner_code}${data.name}`}
              >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
              </Option>))}
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

