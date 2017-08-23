import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Select } from 'antd';
import { toggleCarrierModal, addCarrier, loadCarriers, updateCarrier } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    visible: state.cwmWarehouse.carrierModal.visible,
    carrier: state.cwmWarehouse.carrierModal.carrier,
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
          });
        } else {
          this.props.addCarrier(values, tenantId, whseCode, loginId, ownerTenantId).then((result) => {
            if (!result.error) {
              this.props.loadCarriers(whseCode, tenantId);
              this.props.toggleCarrierModal(false);
            }
          });
        }
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible, whseOwners } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal title="添加承运人" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Form layout="horizontal">
          <FormItem label="名称:" required {...formItemLayout}>
            {getFieldDecorator('name')(<Input required />)}
          </FormItem>
          <FormItem label="代码:" required {...formItemLayout}>
            {getFieldDecorator('code')(<Input />)}
          </FormItem>
          <FormItem label="海关编码:" {...formItemLayout}>
            {getFieldDecorator('customs_code')(<Input />)}
          </FormItem>
          <FormItem label="关联货主:" required {...formItemLayout}>
            {getFieldDecorator('owner_partner_id')(
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
