import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, Checkbox, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { addCustomer } from 'common/reducers/crmCustomers';
import { CUSTOMER_TYPES } from 'common/constants';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { addCustomer }
)

export default class CustomerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    addCustomer: PropTypes.func.isRequired,
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
    this.props.toggle();
  }
  handleOk = () => {
    const { name, partnerCode, partnerUniqueCode, contact, phone, email, customerTypes } = this.state;
    if (!name || name === '') {
      message.error('企业名称必填');
    } else if (!partnerCode || partnerCode === '') {
      message.error('企业编码必填');
    } else if (!partnerUniqueCode || partnerUniqueCode === '') {
      message.error('企业唯一标识码必填');
    } else if (customerTypes.length === 0) {
      message.error('请选择客户业务类型');
    } else {
      this.props.addCustomer({
        tenantId: this.props.tenantId,
        partnerInfo: { name, partnerCode, partnerUniqueCode, contact, phone, email },
        customerTypes,
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
