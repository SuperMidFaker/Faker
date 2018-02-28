import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Input, Checkbox, Select, Row, Col, Button, Icon, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { addCustomer, editCustomer, hideCustomerModal } from 'common/reducers/sofCustomers';
import { getCompanyInfo } from 'common/reducers/common';
import { checkPartner } from 'common/reducers/partner';
import { BUSINESS_TYPES } from 'common/constants';
import messages from '../message.i18n';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { Option } = Select;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.sofCustomers.customerModal.visible,
    customer: state.sofCustomers.customerModal.customer,
    operation: state.sofCustomers.customerModal.operation,
  }),
  {
    addCustomer, editCustomer, checkPartner, hideCustomerModal, getCompanyInfo,
  }
)

export default class CustomerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    operation: PropTypes.string, // add  edit
    addCustomer: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    hideCustomerModal: PropTypes.func.isRequired,
    editCustomer: PropTypes.func.isRequired,
    customer: PropTypes.shape({
      name: PropTypes.string,
    }).isRequired,
    onOk: PropTypes.func,
    getCompanyInfo: PropTypes.func.isRequired,
  }
  state = {
    id: -1,
    name: '',
    partnerCode: '',
    partnerUniqueCode: '',
    customsCode: '',
    contact: '',
    phone: '',
    email: '',
    businessType: '',

    companies: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.operation === 'edit') {
      this.setState({
        id: nextProps.customer.id,
        name: nextProps.customer.name,
        partnerCode: nextProps.customer.partner_code,
        partnerUniqueCode: nextProps.customer.partner_unique_code || '',
        customsCode: nextProps.customer.customs_code || '',
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
      customsCode: '',
      contact: '',
      phone: '',
      email: '',
      businessType: '',
    });
    this.props.hideCustomerModal();
  }
  nameChooseConfirm = (foundName, name) => {
    Modal.confirm({
      title: '请选择',
      content: `${foundName} 与 ${name} 的唯一标识码一致，请选择该标识码下的企业名称`,
      okText: foundName,
      cancelText: name,
      onOk: () => {
        this.setState({ name: foundName }, () => {
          this.hancleAddCustomer();
        });
      },
      onCancel: () => {
        this.hancleAddCustomer();
      },
    });
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
    } else if (this.props.operation === 'edit') {
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
    } else if (partnerUniqueCode) {
      this.props.checkPartner({
        tenantId,
        partnerInfo: { name, partnerCode, partnerUniqueCode },
      }).then((result) => {
        let foundName = name;
        if (result.data.partner && result.data.partner.name !== name) {
          foundName = result.data.partner.name;
        }
        if (foundName !== name) {
          this.nameChooseConfirm(foundName, name);
        } else {
          this.hancleAddCustomer();
        }
      });
    } else {
      this.hancleAddCustomer();
    }
  }
  hancleAddCustomer = () => {
    const {
      name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email, businessType,
    } = this.state;
    const { tenantId } = this.props;
    this.props.addCustomer({
      tenantId,
      partnerInfo: {
        name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email,
      },
      businessType,
    }).then((result1) => {
      if (result1.error) {
        message.error(result1.error.message);
      } else {
        this.handleCancel();
        message.info('添加成功');
      }
    });
  }
  handleCustomerTypesChange = (value) => {
    if (value.length !== 0) {
      this.setState({ businessType: value.join(',') });
    }
  }
  handleSearchCompany = (value) => {
    this.props.getCompanyInfo(value).then((result) => {
      if (result.data.Result) {
        this.setState({ companies: result.data.Result });
      } else {
        message.warning(`企查查：${result.data.Message}`, 5);
      }
    });
  }
  handleNameChange = (value) => {
    const company = this.state.companies.find(item => item.Name === value);
    this.setState({ name: value, partnerUniqueCode: company.CreditCode });
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
      title = '修改客户资料';
    }
    return (
      <Modal
        maskClosable={false}
        visible={visible}
        title={title}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <Form layout="horizontal">
          <FormItem
            {...formItemLayout}
            label="客户名称"
            hasFeedback
            required
          >
            <Row gutter={5}>
              <Col span={20}>
                <Select
                  mode="combobox"
                  value={this.state.name}
                  showSearch
                  placeholder="输入企业名称搜索"
                  optionFilterProp="children"
                  onSelect={value => this.handleNameChange(value)}
                  onChange={value => this.setState({ name: value })}
                >
                  {this.state.companies.map(item => <Option value={item.Name}>{item.Name}</Option>)}
                </Select>
              </Col>
              <Col span={2}>
                <Button size="default" onClick={() => this.handleSearchCompany(this.state.name)}>
                  <Icon type="search" />
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="客户代码"
            hasFeedback
          >
            <Input
              value={this.state.partnerCode}
              onChange={(e) => { this.setState({ partnerCode: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="统一社会信用码"
            hasFeedback
          >
            <Input
              placeholder="请填写18位统一社会信用代码"
              value={this.state.partnerUniqueCode}
              onChange={(e) => { this.setState({ partnerUniqueCode: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="海关编码"
            hasFeedback
          >
            <Input placeholder="请填写10位海关编码" value={this.state.customsCode} onChange={(e) => { this.setState({ customsCode: e.target.value }); }} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="业务类型"
            hasFeedback
          >
            <CheckboxGroup
              options={BUSINESS_TYPES}
              value={businessArray}
              onChange={this.handleCustomerTypesChange}
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
