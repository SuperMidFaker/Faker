import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, Checkbox, AutoComplete, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { addCustomer } from 'common/reducers/crmCustomers';
import { loadTenants } from 'common/reducers/tenants';
import { CUSTOMER_SERVICE_TYPES } from 'common/constants';
const FormItem = Form.Item;
const Option = AutoComplete.Option;
const CheckboxGroup = Checkbox.Group;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { addCustomer, loadTenants }
)

export default class CustomerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    addCustomer: PropTypes.func.isRequired,
    loadTenants: PropTypes.func.isRequired,
  }
  state = {
    tenants: [],
    name: '',
    code: '',
    contact: '',
    phone: '',
    email: '',
    serviceType: [],
    tenantType: 'TENANT_OFFLINE',
    customerTenantId: -1,
  }
  componentWillMount() {
    this.props.loadTenants(null, { pageSize: 99999999, currentPage: 1 }).then((result) => {
      this.setState({ tenants: result.data.data });
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.setState({
      name: '',
      code: '',
      contact: '',
      phone: '',
      email: '',
      serviceType: [],
      tenantType: 'TENANT_OFFLINE',
      customerTenantId: -1,
    });
    this.props.toggle();
  }
  handleOk = () => {
    let transport = 0;
    let clearance = 0;
    const { name, code, contact, phone, email, serviceType, tenantType, customerTenantId } = this.state;
    if (serviceType.indexOf('TRS') >= 0) transport = 1;
    if (serviceType.indexOf('TRS') >= 0) clearance = 1;
    if (!name || name === '') {
      message.error('企业名称必填');
    } else if (!code || code === '') {
      message.error('企业编码必填');
    } else {
      this.props.addCustomer({
        tenantId: this.props.tenantId,
        name, code, contact, phone, email, serviceType, tenantType, customerTenantId, transport, clearance,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('添加成功');
          this.props.toggle();
        }
      });
    }
  }

  handleCustomerChange = (value) => {
    const customer = this.state.tenants.find(item => item.name === value);
    if (customer) {
      this.setState({
        name: customer.name,
        tenantType: 'TENANT_ENTERPRISE',
        customerTenantId: customer.key,
        contact: customer.contact,
        phone: customer.phone,
        email: customer.email,
      });
    } else {
      this.setState({
        name: value,
        tenantType: 'TENANT_OFFLINE',
        customerTenantId: -1,
        contact: '',
        phone: '',
        email: '',
      });
    }
  }
  render() {
    const { visible } = this.props;
    const { tenants } = this.state;

    return (
      <Modal visible={visible} title="新增客户" onCancel={this.handleCancel} onOk={this.handleOk}>
        <Form vertical>
          <FormItem
            label="企业名称"
            hasFeedback
            required
          >
            <AutoComplete
              onChange={this.handleCustomerChange}
              style={{ width: '100%' }}
            >
              {tenants.map((item) => {
                return <Option value={item.name}>{item.name}</Option>;
              })}
            </AutoComplete>
          </FormItem>
          <FormItem
            label="企业编码"
            hasFeedback
            required
          >
            <Input value={this.state.code} onChange={(e) => { this.setState({ code: e.target.value }); }} />
          </FormItem>
          <FormItem
            label="业务类型"
            hasFeedback
          >
            <CheckboxGroup options={CUSTOMER_SERVICE_TYPES} onChange={(value) => { this.setState({ serviceType: value }); }} />
          </FormItem>
          <FormItem
            label="联系人"
            hasFeedback
          >
            <Input
              value={this.state.contact}
              onChange={(e) => { this.setState({ contact: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            label="电话"
            hasFeedback
          >
            <Input
              value={this.state.phone}
              onChange={(e) => { this.setState({ phone: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            label="邮箱"
            hasFeedback
          >
            <Input
              value={this.state.email}
              onChange={(e) => { this.setState({ email: e.target.value }); }}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
