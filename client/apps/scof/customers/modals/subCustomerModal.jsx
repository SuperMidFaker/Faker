import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, Checkbox, Button, Icon, Row, Col, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { addCustomer, editCustomer, hideSubCustomerModal } from 'common/reducers/crmCustomers';
import { BUSINESS_TYPES } from 'common/constants';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.crmCustomers.subCustomerModal.visible,
    customer: state.crmCustomers.subCustomerModal.customer,
    operation: state.crmCustomers.subCustomerModal.operation,
  }),
  { addCustomer, editCustomer, hideSubCustomerModal }
)

export default class SubCustomerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    operation: PropTypes.string, // add  edit
    addCustomer: PropTypes.func.isRequired,
    hideSubCustomerModal: PropTypes.func.isRequired,
    editCustomer: PropTypes.func.isRequired,
    customer: PropTypes.object.isRequired,
    onOk: PropTypes.func,
  }
  state = {
    id: -1,
    parentId: 0,
    name: '',
    partnerCode: '',
    partnerUniqueCode: '',
    customsCode: '',
    contact: '',
    phone: '',
    email: '',
    businessType: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.operation === 'edit') {
      this.setState({
        id: nextProps.customer.id,
        parentId: nextProps.customer.parent_id,
        name: nextProps.customer.name,
        partnerCode: nextProps.customer.partner_code,
        partnerUniqueCode: nextProps.customer.partner_unique_code || '',
        customsCode: nextProps.customer.customs_code || '',
        contact: nextProps.customer.contact,
        phone: nextProps.customer.phone,
        email: nextProps.customer.email,
        businessType: nextProps.customer.business_type,
      });
    } else if (nextProps.operation === 'add') {
      this.setState({
        parentId: nextProps.customer.id,
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
      customsCode: '',
      contact: '',
      phone: '',
      email: '',
      businessType: '',
    });
    this.props.hideSubCustomerModal();
  }
  handleOk = () => {
    const {
      id, name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email, businessType,
    } = this.state;
    const { tenantId, operation } = this.props;
    if (!name || name === '') {
      message.error('企业名称必填');
    } else if (operation === 'add' && businessType.indexOf('clearance') >= 0 && partnerUniqueCode === '') {
      message.error('统一社会信用代码必填');
    } else if (operation === 'add' && businessType.indexOf('clearance') >= 0 && partnerUniqueCode.length !== 18) {
      message.error(`统一社会信用代码必须18位,当前${partnerUniqueCode.length}位`);
    } else if (customsCode && customsCode.length !== 10) {
      message.error(`海关编码必须为10位, 当前${customsCode.length}位`);
    } else if (businessType === '') {
      message.error('请选择客户业务类型');
    } else if (operation === 'edit') {
      this.props.editCustomer({
        tenantId,
        partnerInfo: {
          id, name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email,
        },
        businessType,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.onOk();
          message.success('修改成功');
          this.handleCancel();
        }
      });
    } else {
      this.hancleAddCustomer();
    }
  }
  hancleAddCustomer = () => {
    const {
      parentId, name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email, businessType,
    } = this.state;
    const { tenantId } = this.props;
    this.props.addCustomer({
      tenantId,
      partnerInfo: {
        parentId, name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email,
      },
      businessType,
    }).then((result1) => {
      if (result1.error) {
        message.error(result1.error.message);
      } else {
        this.handleCancel();
        message.info('添加成功');
        this.props.onOk();
      }
    });
  }
  render() {
    const { visible, operation, customer } = this.props;
    const { businessType } = this.state;
    const businessArray = businessType !== '' ? businessType.split(',') : [];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    let title = '';
    if (operation === 'add') {
      title = '新增子客户';
    } else if (operation === 'edit') {
      title = '修改子客户资料';
    }
    return (
      <Modal maskClosable={false} visible={visible} title={title} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Form layout="horizontal">
          <FormItem
            {...formItemLayout}
            label="客户名称"
            hasFeedback
            required
          >
            <Input value={this.state.name} onChange={(e) => { this.setState({ name: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="客户代码"
            hasFeedback
          >
            <Input value={this.state.partnerCode} onChange={(e) => { this.setState({ partnerCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="统一社会信用码"
            hasFeedback
          >
            <Row gutter={5}>
              <Col span={20}>
                <Input placeholder="请填写18位统一社会信用代码"
                  value={this.state.partnerUniqueCode}
                  onChange={(e) => { this.setState({ partnerUniqueCode: e.target.value }); }}
                />
              </Col>
              <Col span={2}>
                <Button size="default" onClick={() => this.setState({ partnerUniqueCode: customer.partner_unique_code })}>
                  <Icon type="left" />
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="海关编码"
            hasFeedback
          >
            <Row gutter={5}>
              <Col span={20}>
                <Input placeholder="请填写10位海关编码"
                  value={this.state.customsCode}
                  onChange={(e) => { this.setState({ customsCode: e.target.value }); }}
                />
              </Col>
              <Col span={2}>
                <Button size="default" onClick={() => this.setState({ customsCode: customer.customs_code })}>
                  <Icon type="left" />
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="业务类型"
            hasFeedback
          >
            <CheckboxGroup options={BUSINESS_TYPES} value={businessArray}
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
