import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Checkbox, Modal, Form, Input, Select, Col, Button, message } from 'antd';
import { getCompanyInfo } from 'common/reducers/common';
import { loadCountries } from 'common/reducers/cmsParams';
import { hidePartnerModal, checkPartner, addPartner, editPartner } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, BUSINESS_TYPES } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

@injectIntl
@connect(
  state => ({
    visible: state.partner.vendorModal.visible,
    vendor: state.partner.vendorModal.vendor,
    operation: state.partner.vendorModal.operation,
    countries: state.cmsParams.countries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
  }),
  {
    addPartner, editPartner, checkPartner, hidePartnerModal, getCompanyInfo, loadCountries,
  }
)
@Form.create()
export default class PartnerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    operation: PropTypes.oneOf(['add', 'edit']),
    addPartner: PropTypes.func.isRequired,
    checkPartner: PropTypes.func.isRequired,
    hidePartnerModal: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    vendor: PropTypes.shape({ id: PropTypes.number, role: PropTypes.string.isRequired }).isRequired,
    onOk: PropTypes.func,
    getCompanyInfo: PropTypes.func.isRequired,
  }
  state = {
    companies: [],
  }
  componentDidMount() {
    this.props.loadCountries();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleCancel = () => {
    this.setState({ companies: [] });
    this.props.hidePartnerModal();
  }
  nameChooseConfirm = (foundName, partnerInfo) => {
    Modal.confirm({
      title: '请选择',
      content: `${foundName} 与 ${partnerInfo.name} 的唯一标识码一致，请选择该标识码下的企业名称`,
      okText: foundName,
      cancelText: partnerInfo.name,
      onOk: () => {
        this.handleAddVendor({ ...partnerInfo, name: foundName });
      },
      onCancel: () => {
        this.handleAddVendor(partnerInfo);
      },
    });
  }
  handlePartnerErrorMsg = (error, partnerInfo) => {
    const errMsg = error.message;
    if (errMsg.key === 'partner_code_exist') {
      const { vendor } = this.props;
      let vendorCodeLabel = '';
      let roleName = '';
      if (vendor.role === PARTNER_ROLES.CUS) {
        vendorCodeLabel = 'customerCode';
        roleName = this.msg('customers');
      } else if (vendor.role === PARTNER_ROLES.VEN) {
        vendorCodeLabel = 'vendorCode';
        roleName = this.msg('vendors');
      } else if (vendor.role === PARTNER_ROLES.SUP) {
        vendorCodeLabel = 'supplierCode';
        roleName = this.msg('suppliers');
      }
      message.error(`${this.msg(vendorCodeLabel)}[${partnerInfo.partnerCode}]已对应${roleName}[${errMsg.conflictName}]`);
    } else {
      message.error(errMsg, 10);
    }
  }
  handleOk = () => {
    const { form, operation, vendor } = this.props;
    form.validateFields((errs, formValues) => {
      if (!errs) {
        const partnerInfo = { ...formValues, role: vendor.role };
        if (formValues.businessType.indexOf('clearance') !== -1) {
          partnerInfo.business = 'CCB,FWD';
        }
        partnerInfo.businessType = formValues.businessType.join(',');
        if (operation === 'edit') {
          this.props.editPartner(vendor.id, partnerInfo).then((result) => {
            if (result.error) {
              this.handlePartnerErrorMsg(result.error, partnerInfo);
            } else {
              message.success(this.msg('savedSuccess'));
              this.handleCancel();
              this.props.onOk();
            }
          });
        } else if (formValues.partnerUniqueCode) {
          const { name, partnerCode, partnerUniqueCode } = partnerInfo;
          this.props.checkPartner({ name, partnerCode, partnerUniqueCode }).then((result) => {
            let foundName = name;
            if (result.data.partner && result.data.partner.name !== name) {
              foundName = result.data.partner.name;
            }
            if (foundName !== name) {
              this.nameChooseConfirm(foundName, partnerInfo);
            } else {
              this.handleAddVendor(partnerInfo);
            }
          });
        } else {
          this.handleAddVendor(partnerInfo);
        }
      }
    });
  }
  handleAddVendor = (partnerInfo) => {
    this.props.addPartner(partnerInfo).then((result1) => {
      if (result1.error) {
        this.handlePartnerErrorMsg(result1.error, partnerInfo);
      } else {
        message.info(this.msg('savedSuccess'));
        this.handleCancel();
        this.props.onOk();
      }
    });
  }
  handleSearchCompany = () => {
    const name = this.props.form.getFieldValue('name');
    this.props.getCompanyInfo(name).then((result) => {
      if (result.data.Result) {
        this.setState({ companies: result.data.Result });
      } else {
        message.warning(result.data.Message, 5);
      }
    });
  }
  handleQiChaChaName = (value) => {
    const company = this.state.companies.find(item => item.Name === value);
    this.props.form.setFieldsValue({
      name: value, partnerUniqueCode: company.CreditCode,
    });
  }
  render() {
    const {
      form: { getFieldDecorator, getFieldValue }, visible, vendor, operation,
    } = this.props;
    if (!visible) {
      return null;
    }
    const { companies } = this.state;
    const businessArray = getFieldValue('businessType') || vendor.business_type || [];
    const country = getFieldValue('country') || vendor.country || '142';
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    let roleName = '';
    let vendorCodeLabel = '';
    let vendorNameLabel = '';
    if (vendor.role === PARTNER_ROLES.CUS) {
      roleName = this.msg('customers');
      vendorCodeLabel = 'customerCode';
      vendorNameLabel = 'customerName';
    } else if (vendor.role === PARTNER_ROLES.VEN) {
      roleName = this.msg('vendors');
      vendorCodeLabel = 'vendorCode';
      vendorNameLabel = 'vendorName';
    } else if (vendor.role === PARTNER_ROLES.SUP) {
      roleName = this.msg('suppliers');
      vendorCodeLabel = 'supplierCode';
      vendorNameLabel = 'supplierName';
    }
    let title = '';
    if (operation === 'add') {
      title = `${this.gmsg('create')}${roleName}`;
    } else if (operation === 'edit') {
      title = `${this.gmsg('edit')}${roleName}${this.msg('profile')}`;
    }
    return (
      <Modal
        width={800}
        maskClosable={false}
        visible={visible}
        title={title}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <Form layout="horizontal" className="form-layout-compact">
          <FormItem
            {...formItemLayout}
            label={this.msg(vendorNameLabel)}
          >
            <Col span={18}>
              {getFieldDecorator('name', {
                  rules: [{
                  required: true,
                  message: this.msg('partnerNameRequired'),
                  }],
                  initialValue: vendor.name,
                })(<Select
                  mode="combobox"
                  showSearch
                  placeholder={this.msg('qichachaCorpSearch')}
                  optionFilterProp="children"
                  onSelect={this.handleQiChaChaName}
                >
                  {companies.map(item => (<Option value={item.Name} key={item.Name}>
                    {item.Name}</Option>))}
                </Select>)}
            </Col>
            <Col span={6}>
              <Button icon="search" onClick={this.handleSearchCompany}>
                {this.msg('businessInfo')}
              </Button>
            </Col>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('displayName')}
          >
            {getFieldDecorator('display_name', { initialValue: vendor.display_name })(<Input />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('englishName')}
          >
            {getFieldDecorator('en_name', { initialValue: vendor.en_name })(<Input />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg(vendorCodeLabel)}
          >
            {getFieldDecorator('partnerCode', { initialValue: vendor.partner_code })(<Input />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('businessType')}
          >
            {getFieldDecorator('country', {
                  initialValue: vendor.country || '142',
                })(<Select>
                  {this.props.countries.map(coun => (<Option key={coun.value} value={coun.value}>
                    {coun.text}
                  </Option>))}
                </Select>)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('uscCode')}
          >
            {getFieldDecorator('partnerUniqueCode', {
              initialValue: vendor.partner_unique_code,
              rules: [{
              required: country === '142',
              message: this.msg('uscCode18len'),
              }],
                })(<Input placeholder={this.msg('uscCode18len')} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('customsCode')}
          >
            {getFieldDecorator('customsCode', {
              initialValue: vendor.customs_code,
              rules: [{
              required: businessArray.indexOf(PARTNER_BUSINESSE_TYPES.clearance) >= 0,
              message: this.msg('customsCode10len'),
              }],
                })(<Input placeholder={this.msg('customsCode10len')} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('contact')}
          >
            {getFieldDecorator('contact', {
                  initialValue: vendor.contact,
                })(<Input />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('phone')}
          >
            {getFieldDecorator('phone', {
                  initialValue: vendor.phone,
                })(<Input type="tel" />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('email')}
          >
            {getFieldDecorator('email', {
                  initialValue: vendor.email,
                })(<Input type="email" />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.msg('businessType')}
          >
            {getFieldDecorator('businessType', {
              initialValue: vendor.business_type ? vendor.business_type.split(',') : [],
              rules: [{
              required: vendor.role === PARTNER_ROLES.VEN,
              message: this.msg('vendorBusinessTypeRequired'),
              }],
            })(<CheckboxGroup options={BUSINESS_TYPES} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
