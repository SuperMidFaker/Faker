import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Checkbox, Modal, Form, Input, Select, Row, Col, Button, Icon, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { hideVendorModal } from 'common/reducers/sofVendors';
import { getCompanyInfo } from 'common/reducers/common';
import { checkPartner, addPartner, editPartner } from 'common/reducers/partner';
import { BUSINESS_TYPES } from 'common/constants';
import messages from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.sofVendors.vendorModal.visible,
    vendor: state.sofVendors.vendorModal.vendor,
    operation: state.sofVendors.vendorModal.operation,
  }),
  {
    addPartner, editPartner, checkPartner, hideVendorModal, getCompanyInfo,
  }
)

export default class VendorModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    operation: PropTypes.string, // add  edit
    addPartner: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    hideVendorModal: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    vendor: PropTypes.shape({ id: PropTypes.number }).isRequired,
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
        id: nextProps.vendor.id,
        name: nextProps.vendor.name,
        partnerCode: nextProps.vendor.partner_code,
        partnerUniqueCode: nextProps.vendor.partner_unique_code || '',
        customsCode: nextProps.vendor.customs_code || '',
        contact: nextProps.vendor.contact,
        phone: nextProps.vendor.phone,
        email: nextProps.vendor.email,
        businessType: nextProps.vendor.business_type,
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
    this.props.hideVendorModal();
  }
  nameChooseConfirm = (foundName, name) => {
    Modal.confirm({
      title: '请选择',
      content: `${foundName} 与 ${name} 的唯一标识码一致，请选择该标识码下的企业名称`,
      okText: foundName,
      cancelText: name,
      onOk: () => {
        this.setState({ name: foundName }, () => {
          this.handleAddVendor();
        });
      },
      onCancel: () => {
        this.handleAddVendor();
      },
    });
  }
  handleOk = () => {
    const {
      id, name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email, businessType,
    } = this.state;
    const { tenantId, operation } = this.props;
    let business;
    if (businessType.indexOf('clearance') !== -1 && businessType.indexOf('transport') !== -1) {
      business = 'CCB,TRS,CIB,ICB';
    } else if (businessType.indexOf('clearance') !== -1 && businessType.indexOf('transport') === -1) {
      business = 'CCB,CIB,ICB';
    } else if (businessType.indexOf('clearance') === -1 && businessType.indexOf('transport') !== -1) {
      business = 'TRS';
    } else {
      business = '';
    }
    if (!name || name === '') {
      message.error('企业名称必填');
    } else if (operation === 'add' && businessType.indexOf('clearance') >= 0 && partnerUniqueCode === '') {
      message.error('统一社会信用代码必填');
    } else if (operation === 'add' && businessType.indexOf('clearance') >= 0 && partnerUniqueCode.length !== 18) {
      message.error(`统一社会信用代码必须18位,当前${partnerUniqueCode.length}位`);
    } else if (customsCode && customsCode.length !== 10) {
      message.error(`海关编码必须为10位, 当前${customsCode.length}位`);
    } else if (businessType === '') {
      message.error('请选择服务商业务类型');
    } else if (this.props.operation === 'edit') {
      this.props.editPartner(id, name, partnerUniqueCode, partnerCode, 'SUP', business, customsCode, businessType, contact, phone, email).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.success('修改成功');
          this.handleCancel();
          this.props.onOk();
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
          this.handleAddVendor();
        }
      });
    } else {
      this.handleAddVendor();
    }
  }
  handleAddVendor = () => {
    const {
      name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email, businessType,
    } = this.state;
    const { tenantId } = this.props;
    let business;
    if (businessType.indexOf('clearance') !== -1 && businessType.indexOf('transport') !== -1) {
      business = 'CCB,TRS,CIB,ICB';
    } else if (businessType.indexOf('clearance') !== -1 && businessType.indexOf('transport') === -1) {
      business = 'CCB,CIB,ICB';
    } else if (businessType.indexOf('clearance') === -1 && businessType.indexOf('transport') !== -1) {
      business = 'TRS';
    } else {
      business = '';
    }
    this.props.addPartner({
      tenantId,
      partnerInfo: {
        partnerName: name, partnerCode, partnerUniqueCode, customsCode, contact, phone, email,
      },
      businessType,
      role: 'SUP',
      business,
    }).then((result1) => {
      if (result1.error) {
        message.error(result1.error.message);
      } else {
        message.info('添加成功');
        this.handleCancel();
        this.props.onOk();
      }
    });
  }
  handleVendorTypesChange = (value) => {
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
      title = '新增服务商';
    } else if (operation === 'edit') {
      title = '修改服务商资料';
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
            label="服务商名称"
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
            label="服务商代码"
            hasFeedback
          >
            <Input
              value={this.state.partnerCode}
              onChange={(e) => { this.setState({ partnerCode: e.target.value }); }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="业务类型"
            hasFeedback
          >
            <CheckboxGroup
              options={BUSINESS_TYPES}
              value={businessArray}
              onChange={this.handleVendorTypesChange}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="统一社会信用码"
            hasFeedback
          >
            <Input placeholder="请填写18位统一社会信用代码" value={this.state.partnerUniqueCode} onChange={(e) => { this.setState({ partnerUniqueCode: e.target.value }); }} />
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
