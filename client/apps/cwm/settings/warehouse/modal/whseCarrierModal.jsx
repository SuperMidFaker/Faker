import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Select } from 'antd';
import { toggleCarrierModal, addCarrier, loadCarriers, updateCarrier } from 'common/reducers/cwmWarehouse';
import { loadPartners } from 'common/reducers/partner';
import connectFetch from 'client/common/decorators/connect-fetch';
import { formatMsg } from '../message.i18n';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const FormItem = Form.Item;
const Option = Select.Option;

const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.transport;

function fetchData({ dispatch, state }) {
  return dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role,
    businessType,
  }));
}

@connectFetch()(fetchData)

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    visible: state.cwmWarehouse.carrierModal.visible,
    carrier: state.cwmWarehouse.carrierModal.carrier,
    partners: state.partner.partners,
  }),
  { toggleCarrierModal, addCarrier, loadCarriers, updateCarrier }
)

@Form.create()

export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.carrier.id) {
      this.props.form.setFieldsValue(nextProps.carrier);
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleCarrierModal(false);
    this.props.form.resetFields();
  }
  handleAdd = () => {
    const { tenantId, whseCode, loginId, whseOwners, carrier } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const ownerTenantId = whseOwners.find(owner => owner.owner_partner_id === values.owner_partner_id).owner_tenant_id;
        if (carrier.id) {
          this.props.updateCarrier(values, carrier.id, loginId).then(() => {
            this.props.loadCarriers(whseCode, tenantId);
            this.props.toggleCarrierModal(false);
            this.props.form.resetFields();
          });
        } else {
          this.props.addCarrier(values, tenantId, whseCode, loginId, ownerTenantId).then((result) => {
            if (!result.error) {
              this.props.loadCarriers(whseCode, tenantId);
              this.props.toggleCarrierModal(false);
              this.props.form.resetFields();
            }
          });
        }
      }
    });
  }
  handleSelect = (value) => {
    const { partners, form } = this.props;
    const carrier = partners.find(partner => partner.name === value);
    form.setFieldsValue({
      name: carrier.name,
      code: carrier.partner_unique_code,
      customs_code: carrier.customs_code,
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible, whseOwners, partners } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal maskClosable={false} title="添加承运人" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Form layout="horizontal">
          {visible && <FormItem label="名称:" required {...formItemLayout}>
            {getFieldDecorator('name', {
              rules: [{ required: true }],
            })(
              <Select mode="combobox" style={{ width: '100%' }} onSelect={this.handleSelect}>
                {partners.map(partner => (<Option value={partner.name} key={partner.name}>{partner.name}</Option>))}
              </Select>)}
          </FormItem>}
          <FormItem label="代码:" {...formItemLayout}>
            {getFieldDecorator('code', {
              rules: [{ required: true }],
            })(<Input />)}
          </FormItem>
          <FormItem label="海关编码:" {...formItemLayout}>
            {getFieldDecorator('customs_code')(<Input />)}
          </FormItem>
          <FormItem label="关联货主:" {...formItemLayout}>
            {getFieldDecorator('owner_partner_id', {
              rules: [{ required: true }],
            })(
              <Select id="select"
                showSearch
                placeholder=""
                optionFilterProp="children"
                notFoundContent=""
              >
                {
                  whseOwners.map(pt => (
                    <Option searched={`${pt.owner_code}${pt.owner_name}`}
                      value={pt.owner_partner_id} key={pt.owner_partner_id}
                    >
                      {pt.owner_code ? `${pt.owner_code} | ${pt.owner_name}` : pt.owner_name}
                    </Option>)
                  )
                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
