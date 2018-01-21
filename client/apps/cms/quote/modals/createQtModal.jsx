import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, message, Form, Select } from 'antd';
import { closeCreateModal, loadPartners, createQuote } from 'common/reducers/cmsQuote';

import { formatMsg } from '../message.i18n';
import { TARIFF_KINDS, PARTNER_ROLES } from 'common/constants';


const { Option } = Select;
const FormItem = Form.Item;
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
    partners: state.cmsQuote.partners,
    quoteData: state.cmsQuote.quoteData,
  }),
  { closeCreateModal, loadPartners, createQuote }
)
@Form.create()
export default class CreateQtModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    partners: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    disBase: false,
  };
  handleCancel = () => {
    this.props.closeCreateModal();
  }
  handleOk = () => {
    const quoteData = {};
    const field = this.props.form.getFieldsValue();
    if (field.partner.name) {
      const selpartners = this.props.partners.filter(pt => pt.name === field.partner.name);
      quoteData.partner = selpartners[0];
    }
    if (field.tariff_kind === 'salesBase') {
      quoteData.recv_tenant_id = this.props.tenantId;
      quoteData.recv_tenant_name = this.props.tenantName;
    } else if (field.tariff_kind === 'costBase') {
      quoteData.send_tenant_id = this.props.tenantId;
      quoteData.send_tenant_name = this.props.tenantName;
    } else if (field.tariff_kind === 'sales') {
      quoteData.send_tenant_id = quoteData.partner.tid;
      quoteData.send_tenant_name = quoteData.partner.name;
      quoteData.send_partner_id = quoteData.partner.partner_id;
      quoteData.recv_tenant_id = this.props.tenantId;
      quoteData.recv_tenant_name = this.props.tenantName;
    } else if (field.tariff_kind === 'cost') {
      quoteData.send_tenant_id = this.props.tenantId;
      quoteData.send_tenant_name = this.props.tenantName;
      quoteData.recv_tenant_id = quoteData.partner.tid;
      quoteData.recv_tenant_name = quoteData.partner.name;
      quoteData.recv_partner_id = quoteData.partner.partner_id;
    }
    quoteData.tenantId = this.props.tenantId;
    quoteData.modifyById = this.props.loginId;
    quoteData.modifyBy = this.props.loginName;
    const prom = this.props.createQuote(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.closeCreateModal();
        const { quoteNo, version } = result.data;
        this.context.router.push(`/clearance/quote/edit/${quoteNo}/${version}`);
      }
    });
  }
  handleKindSelect = (value) => {
    const tariffKind = value;
    if (tariffKind === 'sales') {
      this.props.loadPartners(this.props.tenantId, PARTNER_ROLES.CUS);
      this.setState({ disBase: false });
    } else if (tariffKind === 'cost') {
      this.props.loadPartners(this.props.tenantId, PARTNER_ROLES.SUP);
      this.setState({ disBase: false });
    } else {
      this.props.form.setFieldsValue({ 'partner.name': '' });
      this.setState({ disBase: true });
    }
  }
  handleClientChange = (value) => {
    if (typeof value === 'string') {
      return value;
    }
    const selPartnerId = Number(value);
    const partners = this.props.partners.filter(cl => cl.partner_id === selPartnerId);
    if (partners.length === 1) {
      const partner = partners[0];
      return partner.name;
    }
    return value;
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, visible, partners } = this.props;
    const { disBase } = this.state;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newQuote')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <div>
          <FormItem label={this.msg('tariffKinds')} {...formItemLayout}>
            {getFieldDecorator('tariff_kind', {
              rules: [{ required: true, message: '报价类型必选' }],
            })(<Select style={{ width: '100%' }} onSelect={this.handleKindSelect}>
              {
                TARIFF_KINDS.map(qt =>
                  <Option value={qt.value} key={qt.value}>{qt.text}</Option>)
              }
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('partnerLabel')} {...formItemLayout}>
            {getFieldDecorator('partner.name', {
              rules: [{ required: true, message: '必选' }],
              getValueFromEvent: this.handleClientChange,
            })(<Select
              showSearch
              showArrow
              optionFilterProp="searched"
              style={{ width: '100%' }}
              disabled={disBase}
            >
              {
                partners.map(pt => (
                  <Option
                    searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id}
                    key={pt.partner_id}
                  >{pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                  </Option>))
              }
            </Select>)}
          </FormItem>
        </div>
      </Modal>
    );
  }
}

