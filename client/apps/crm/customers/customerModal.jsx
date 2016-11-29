import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, Checkbox, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { addCustomer, editCustomer, showCustomerModal, hideCustomerModal } from 'common/reducers/crmCustomers';
import { checkPartner } from 'common/reducers/partner';
import { CUSTOMER_TYPES } from 'common/constants';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.crmCustomers.customerModal.visible,
    customer: state.crmCustomers.customerModal.customer,
    operation: state.crmCustomers.customerModal.operation,
  }),
  { addCustomer, editCustomer, checkPartner, showCustomerModal, hideCustomerModal }
)

export default class CustomerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    operation: PropTypes.string, // add  edit
    addCustomer: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
    hideCustomerModal: PropTypes.func.isRequired,
    editCustomer: PropTypes.func.isRequired,
    customer: PropTypes.object.isRequired,
    onOk: PropTypes.func,
  }
  state = {
    id: -1,
    name: '',
    partnerCode: '',
    partnerUniqueCode: '',
    contact: '',
    phone: '',
    email: '',
    businessType: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.operation === 'edit') {
      this.setState({
        id: nextProps.customer.id,
        name: nextProps.customer.name,
        partnerCode: nextProps.customer.partner_code,
        partnerUniqueCode: nextProps.customer.partner_unique_code || '',
        contact: nextProps.customer.contact,
        phone: nextProps.customer.phone,
        email: nextProps.customer.email,
        businessType: nextProps.customer.business_type,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.setState({
      id: -1,
      name: '',
      partnerCode: '',
      partnerUniqueCode: '',
      contact: '',
      phone: '',
      email: '',
      businessType: '',
    });
    this.props.hideCustomerModal();
  }
  handleOk = () => {
    const { id, name, partnerCode, partnerUniqueCode, contact, phone, email, businessType } = this.state;
    const { tenantId, operation } = this.props;
    if (!name || name === '') {
      message.error('企业名称必填');
    } else if (operation === 'add' && partnerUniqueCode === '') {
      message.error('企业唯一标识码必填');
    } else if (businessType === '') {
      message.error('请选择客户业务类型');
    } else if (this.props.operation === 'edit') {
      this.props.editCustomer({
        tenantId,
        partnerInfo: { id, name, partnerCode, partnerUniqueCode, contact, phone, email },
        businessType,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.onOk();
          message.success('修改成功');
          this.handleCancel();
        }
      });
    } else {
      this.props.checkPartner({
        tenantId,
        partnerInfo: { name, partnerCode, partnerUniqueCode },
      }).then((result) => {
        let customerName = name;
        if (result.data.partner && result.data.partner.name !== name) {
          customerName = result.data.partner.name;
        }
        this.props.addCustomer({
          tenantId,
          partnerInfo: { name: customerName, partnerCode, partnerUniqueCode, contact, phone, email },
          businessType,
        }).then((result1) => {
          if (result1.error) {
            message.error(result1.error.message);
          } else {
            this.handleCancel();
            if (customerName !== name) {
              message.info(`添加成功 找到 企业唯一标识码为:${partnerUniqueCode} 的企业信息， 已将企业名称 ${name} 替换为 ${customerName} `, 10);
            } else {
              message.info('添加成功');
            }
          }
        });
      });
    }
  }

  render() {
    const { visible, operation } = this.props;
    const { businessType } = this.state;
    const businessArray = businessType !== '' ? businessType.split(',') : [];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    let title = '';
    if (operation === 'add') {
      title = '新增客户';
    } else if (operation === 'edit') {
      title = '修改客户';
    }
    return (
      <Modal visible={visible} title={title} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="企业名称"
            hasFeedback
            required
          >
            <Input value={this.state.name} onChange={(e) => { this.setState({ name: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="企业唯一标识码"
            hasFeedback
            required
          >
            <Input value={this.state.partnerUniqueCode} onChange={(e) => { this.setState({ partnerUniqueCode: e.target.value }); }} disabled={operation === 'edit'} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="企业代码"
            hasFeedback
          >
            <Input value={this.state.partnerCode} onChange={(e) => { this.setState({ partnerCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="业务类型"
            hasFeedback
          >
            <CheckboxGroup options={CUSTOMER_TYPES} value={businessArray}
              onChange={(value) => {
                if (value !== []) {
                  this.setState({ businessType: value.join(',') });
                }
              }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="联系人"
            hasFeedback
          >
            <Input
              value={this.state.contact}
              onChange={(e) => { this.setState({ contact: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="电话"
            hasFeedback
          >
            <Input
              type="tel"
              value={this.state.phone}
              onChange={(e) => { this.setState({ phone: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="邮箱"
            hasFeedback
          >
            <Input
              type="email"
              value={this.state.email}
              onChange={(e) => { this.setState({ email: e.target.value }); }}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
