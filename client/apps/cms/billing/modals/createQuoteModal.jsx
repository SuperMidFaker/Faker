import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Modal, message, Form, Radio, Select } from 'antd';
import { toggleQuoteCreateModal, createQuote } from 'common/reducers/cmsQuote';
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
    visible: state.cmsQuote.visibleCreateModal,
    partners: state.partner.partners,
  }),
  { toggleQuoteCreateModal, loadPartners, createQuote }
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
  state = {
    partners: [],
    partnerLabel: '客户',
  }
  componentDidMount() {
    this.props.loadPartners({
      role: [PARTNER_ROLES.CUS, PARTNER_ROLES.SUP],
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleQuoteCreateModal(false);
  }
  handleOk = () => {
    const field = this.props.form.getFieldsValue();
    const prom = this.props.createQuote({
      quote_partner_id: Number(field.partnerId),
      quote_type: field.quote_type,
      quote_name: field.quote_name,
    });
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.toggleQuoteCreateModal(false);
        const { quoteNo } = result.data;
        this.context.router.push(`/clearance/billing/quote/${quoteNo}`);
      }
    });
  }
  handleTypeSelect = (ev) => {
    const quoteType = ev.target.value;
    if (quoteType === 'sales') {
      const client = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.CUS);
      this.setState({ partners: client, partnerLabel: this.msg('client') });
    } else if (quoteType === 'cost') {
      const service = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.SUP);
      this.setState({ partners: service, partnerLabel: this.msg('provider') });
    }
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
            })(<RadioGroup onChange={this.handleTypeSelect}>
              {
                QUOTE_TYPE.map(qt =>
                  <RadioButton value={qt.value} key={qt.value}>{qt.text}</RadioButton>)
              }
            </RadioGroup>)}
          </FormItem>
          <FormItem label={this.state.partnerLabel} {...formItemLayout}>
            {getFieldDecorator('partnerId', {
              rules: [{ required: true, message: '必选' }],
            })(<Select
              showSearch
              showArrow
              optionFilterProp="children"
              style={{ width: '100%' }}
            >
              {
                this.state.partners.map(pt => (
                  <Option
                    value={String(pt.id)}
                    key={String(pt.id)}
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

