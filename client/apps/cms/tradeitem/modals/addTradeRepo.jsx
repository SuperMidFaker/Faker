import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Select, message } from 'antd';
import { createRepo, closeAddModal, loadOwners } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visibleAddModal: state.cmsTradeitem.visibleAddModal,
    customers: state.crmCustomers.customers,
  }),
  { createRepo, closeAddModal, loadOwners }
)
export default class AddTradeRepoModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    visibleAddModal: PropTypes.bool.isRequired,
    customers: PropTypes.array.isRequired,
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
    }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ customerid: null });
          this.props.loadOwners({
            tenantId: this.props.tenantId,
          });
          this.props.closeAddModal();
        }
      });
  }
  handleSelectChange = (value) => {
    this.setState({ customerid: value });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visibleAddModal, customers } = this.props;
    return (
      <Modal title={this.msg('addOWner')} visible={visibleAddModal}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Select
          showSearch
          style={{ width: '80%' }}
          placeholder="选择客户"
          optionFilterProp="children"
          size="large"
          onChange={this.handleSelectChange}
        >
          {
            customers.map(data => (<Option key={data.id} value={data.id}
              search={`${data.partner_code}${data.name}`}
            >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
            )}
        </Select>
      </Modal>
    );
  }
}

