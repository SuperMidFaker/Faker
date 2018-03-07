import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Modal, message, Form, Radio, Select } from 'antd';
import { closeCreateModal, createQuote } from 'common/reducers/cmsQuote';
import { loadPartners } from 'common/reducers/partner';
import { QUOTE_TYPE, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Option } = Select;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.cmsQuote.visibleCreateModal,
    partners: state.partner.partners,
    quoteData: state.cmsQuote.quoteData,
  }),
  { closeCreateModal, loadPartners, createQuote }
)
@Form.create()
export default class CreateQuoteModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    partners: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
    })).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  state = {
    partners: [],
    partnerLabel: this.msg('client'),
  }
  componentDidMount() {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role: [ PARTNER_ROLES.CUS, PARTNER_ROLES.SUP],
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
  }
  handleCancel = () => {
    this.props.closeCreateModal();
  }
  handleOk = () => {
    const quoteData = {};
    const field = this.props.form.getFieldsValue();
    if (field.partner.name) {
      const selpartners = this.props.partners.filter(pt => pt.name === field.partner.name);
      [quoteData.partner] = selpartners;
    }
    if (field.quote_type === 'sales') {
      quoteData.send_tenant_id = quoteData.partner.tid;
      quoteData.send_tenant_name = quoteData.partner.name;
      quoteData.send_partner_id = quoteData.partner.id;
      quoteData.recv_tenant_id = this.props.tenantId;
      quoteData.recv_tenant_name = this.props.tenantName;
    } else if (field.quote_type === 'cost') {
      quoteData.send_tenant_id = this.props.tenantId;
      quoteData.send_tenant_name = this.props.tenantName;
      quoteData.recv_tenant_id = quoteData.partner.tid;
      quoteData.recv_tenant_name = quoteData.partner.name;
      quoteData.recv_partner_id = quoteData.partner.id;
    }
    quoteData.quote_name = field.quote_name;
    quoteData.tenantId = this.props.tenantId;
    quoteData.modifyById = this.props.loginId;
    quoteData.modifyBy = this.props.loginName;
    const prom = this.props.createQuote(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.closeCreateModal();
        const { quoteNo } = result.data;
        this.context.router.push(`/clearance/billing/quote/${quoteNo}`);
      }
    });
  }
  handleKindSelect = (ev) => {
    const tariffKind = ev.target.value;
    if (tariffKind === 'sales') {
      const client = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.CUS);
      this.setState({ partners: client, partnerLabel: this.msg('client') });
    } else if (tariffKind === 'cost') {
      const service = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.SUP);
      this.setState({ partners: service, partnerLabel: this.msg('provider') });
    }
  }
  handleClientChange = (value) => {
    if (typeof value === 'string') {
      return value;
    }
    const selPartnerId = Number(value);
    const partners = this.props.partners.filter(cl => cl.id === selPartnerId);
    if (partners.length === 1) {
      const partner = partners[0];
      return partner.name;
    }
    return value;
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newQuote')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <div>
          <FormItem label={this.msg('quoteType')} {...formItemLayout}>
            {getFieldDecorator('quote_type', {
              rules: [{ required: true, message: '报价类型必选' }],
            })(<RadioGroup onChange={this.handleKindSelect}>
              {
                QUOTE_TYPE.map(qt =>
                  <RadioButton value={qt.value} key={qt.value}>{qt.text}</RadioButton>)
              }
            </RadioGroup>)}
          </FormItem>
          <FormItem label={this.state.partnerLabel} {...formItemLayout}>
            {getFieldDecorator('partner.name', {
              rules: [{ required: true, message: '必选' }],
              getValueFromEvent: this.handleClientChange,
            })(<Select
              showSearch
              showArrow
              optionFilterProp="children"
              style={{ width: '100%' }}
            >
              {
                this.state.partners.map(pt => (
                  <Option
                    
                    value={pt.id}
                    key={pt.id}
                  >{pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                  </Option>))
              }
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('quoteName')} {...formItemLayout}>
            {getFieldDecorator('quote_name', {
              rules: [{ required: true, message: '报价名称必填' }],
            })(<Input />)}
          </FormItem>
        </div>
      </Modal>
    );
  }
}

