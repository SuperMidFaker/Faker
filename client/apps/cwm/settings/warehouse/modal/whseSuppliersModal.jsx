import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Select } from 'antd';
import { toggleSupplierModal, addSupplier, loadSuppliers, updateSupplier, loadwhseOwners } from 'common/reducers/cwmWarehouse';
import { getSuppliers } from 'common/reducers/cwmReceive';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    visible: state.cwmWarehouse.supplierModal.visible,
    supplier: state.cwmWarehouse.supplierModal.supplier,
  }),
  { toggleSupplierModal, addSupplier, loadSuppliers, updateSupplier, loadwhseOwners, getSuppliers }
)

@Form.create()
export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    ownerPartnerId: PropTypes.number,
  }
  componentWillMount() {
    this.props.loadwhseOwners(this.props.whseCode, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.supplier.id) {
      this.props.form.setFieldsValue(nextProps.supplier);
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleSupplierModal(false);
    this.props.form.resetFields();
  }
  handleAdd = () => {
    const { tenantId, whseCode, loginId, whseOwners, supplier, ownerPartnerId } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const ownerTenantId = whseOwners.find(owner => owner.owner_partner_id === values.owner_partner_id).owner_tenant_id;
        if (supplier.id) {
          this.props.updateSupplier(values, supplier.id, loginId).then(() => {
            this.props.loadSuppliers(whseCode, tenantId);
            this.props.toggleSupplierModal(false);
          });
        } else {
          this.props.addSupplier(values, tenantId, whseCode, loginId, ownerTenantId).then((result) => {
            if (!result.error) {
              this.props.loadSuppliers(whseCode, tenantId);
              this.props.toggleSupplierModal(false);
              if (ownerPartnerId) {
                this.props.getSuppliers(tenantId, whseCode, ownerPartnerId);
              }
            }
          });
        }
      }
      this.props.form.resetFields();
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible, whseOwners, ownerPartnerId } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal title="添加供应商" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
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
          <FormItem label="发货仓库号:" {...formItemLayout}>
            {getFieldDecorator('ftz_whse_code')(<Input />)}
          </FormItem>
          <FormItem label="关联货主:" required {...formItemLayout}>
            {getFieldDecorator('owner_partner_id', {
              initialValue: ownerPartnerId,
            })(
              <Select id="select"
                showSearch
                placeholder=""
                optionFilterProp="children"
                notFoundContent=""
                disabled={!!ownerPartnerId}
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
