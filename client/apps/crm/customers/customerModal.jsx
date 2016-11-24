import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, Checkbox, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { addCustomer, showCustomerModal, hideCustomerModal } from 'common/reducers/crmCustomers';
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
    partnerId: state.crmCustomers.customerModal.customer,
  }),
  { addCustomer, checkPartner, showCustomerModal, hideCustomerModal }
)

export default class CustomerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    addCustomer: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
    hideCustomerModal: PropTypes.func.isRequired,
    partnerId: PropTypes.number.isRequired,
  }
  state = {
    name: '',
    partnerCode: '',
    partnerUniqueCode: '',
    contact: '',
    phone: '',
    email: '',
    customerTypes: [],
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.setState({
      name: '',
      partnerCode: '',
      partnerUniqueCode: '',
      contact: '',
      phone: '',
      email: '',
      customerTypes: [],
    });
    this.props.hideCustomerModal();
  }
  handleOk = () => {
    const { name, partnerCode, partnerUniqueCode, contact, phone, email, customerTypes } = this.state;
    const { tenantId } = this.props;
    if (!name || name === '') {
      message.error('企业名称必填');
    } else if (!partnerCode || partnerCode === '') {
      message.error('企业编码必填');
    } else if (!partnerUniqueCode || partnerUniqueCode === '') {
      message.error('企业唯一标识码必填');
    } else if (customerTypes.length === 0) {
      message.error('请选择客户业务类型');
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
          customerTypes,
        }).then((result1) => {
          if (result1.error) {
            message.error(result1.error.message);
          } else {
            if (customerName !== name) {
              message.info(`添加成功 找到 企业唯一标识码为:${partnerUniqueCode} 的企业信息， 已将企业名称 ${name} 替换为 ${customerName} `, 10);
            } else {
              message.info('添加成功');
            }
            this.handleCancel();
          }
        });
      });
    }
  }

  render() {
    const { visible } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return (
      <Modal visible={visible} title="新增客户" onCancel={this.handleCancel} onOk={this.handleOk}>
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
            label="企业编码"
            hasFeedback
            required
          >
            <Input value={this.state.partnerCode} onChange={(e) => { this.setState({ partnerCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="企业唯一标识码"
            hasFeedback
            required
          >
            <Input value={this.state.partnerUniqueCode} onChange={(e) => { this.setState({ partnerUniqueCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="业务类型"
            hasFeedback
          >
            <CheckboxGroup options={CUSTOMER_TYPES} onChange={(value) => { this.setState({ customerTypes: value }); }} />
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
              value={this.state.email}
              onChange={(e) => { this.setState({ email: e.target.value }); }}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
