import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Select, message } from 'antd';
import { createRepo, closeAddModal, loadRepos } from 'common/reducers/cmsTradeitem';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
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
    customers: state.partner.partners,
    repos: state.cmsTradeitem.repos,
  }),
  {
    createRepo, closeAddModal, loadPartners, loadRepos,
  }
)
@Form.create()
export default class AddTradeRepoModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    visibleAddModal: PropTypes.bool.isRequired,
    customers: PropTypes.arrayOf({ id: PropTypes.number }).isRequired,
    repos: PropTypes.arrayOf({ owner_partner_id: PropTypes.number }).isRequired,
  }
  state = {
    customerid: null,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visibleAddModal && !this.props.visibleAddModal) {
      this.props.loadPartners({
        role: PARTNER_ROLES.CUS,
        businessType: PARTNER_BUSINESSE_TYPES.clearance,
      });
    }
  }
  handleCancel = () => {
    this.props.closeAddModal();
  }
  handleOk = () => {
    const customer = this.props.customers.filter(cust =>
      cust.id === this.state.customerid)[0];
    this.props.createRepo({
      createrTenantId: this.props.tenantId,
      ownerPartnerId: customer.partner_id,
      ownerTenantId: customer.tid,
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
    const newCustomers = customers.filter(ct =>
      repos.filter(repo => repo.owner_partner_id === ct.id || (ct.partner_tenant_id !== -1 &&
        repo.owner_tenant_id === ct.partner_tenant_id)).length === 0);
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
            {getFieldDecorator('customerId')(<Select
              showSearch
              placeholder="选择客户"
              optionFilterProp="children"
              onChange={this.handleSelectChange}
            >
              {newCustomers.map(data => (<Option
                key={data.id}
                value={data.id}
              >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
              </Option>))}
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

