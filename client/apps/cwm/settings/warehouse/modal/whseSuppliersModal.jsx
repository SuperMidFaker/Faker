import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Select } from 'antd';
import { toggleSupplierModal, addSupplier, loadSuppliers, updateSupplier, loadwhseOwners } from 'common/reducers/cwmWarehouse';
import { getSuppliers } from 'common/reducers/cwmReceive';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    whseOwners: state.cwmWarehouse.whseOwners,
    visible: state.cwmWarehouse.supplierModal.visible,
    supplier: state.cwmWarehouse.supplierModal.supplier,
  }),
  {
    toggleSupplierModal, addSupplier, loadSuppliers, updateSupplier, loadwhseOwners, getSuppliers,
  }
)

@Form.create()
export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    ownerPartnerId: PropTypes.number,
  }
  componentDidMount() {
    this.props.loadwhseOwners(this.props.whseCode);
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleSupplierModal(false);
    this.props.form.resetFields();
  }
  handleAdd = () => {
    const {
      whseCode, supplier, ownerPartnerId,
    } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (supplier.id) {
          this.props.updateSupplier(values, supplier.id).then((result) => {
            if (!result.error) {
              this.props.loadSuppliers(whseCode);
              this.handleCancel();
            }
          });
        } else {
          this.props.addSupplier(values, whseCode).then((result) => {
            if (!result.error) {
              this.props.loadSuppliers(whseCode);
              if (ownerPartnerId) {
                this.props.getSuppliers(whseCode, ownerPartnerId);
              }
              this.handleCancel();
            }
          });
        }
      }
    });
  }
  render() {
    const {
      form: { getFieldDecorator }, visible, whseOwners, ownerPartnerId, supplier = {},
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal maskClosable={false} title="添加供货商" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Form layout="horizontal">
          <FormItem label="名称" {...formItemLayout}>
            {getFieldDecorator('name', { rules: [{ required: true }], initialValue: supplier.name })(<Input />)}
          </FormItem>
          <FormItem label="代码" {...formItemLayout}>
            {getFieldDecorator('code', { rules: [{ required: true }], initialValue: supplier.code })(<Input />)}
          </FormItem>
          <FormItem label="海关编码" {...formItemLayout}>
            {getFieldDecorator('customs_code', { initialValue: supplier.customs_code })(<Input />)}
          </FormItem>
          <FormItem label="供货商仓库海关编码" {...formItemLayout}>
            {getFieldDecorator('ftz_whse_code', { initialValue: supplier.ftz_whse_code })(<Input />)}
          </FormItem>
          <FormItem label="关联货主" {...formItemLayout}>
            {getFieldDecorator('owner_partner_id', {
              initialValue: ownerPartnerId,
              rules: [{ required: true }],
            })(<Select
              id="select"
              showSearch
              placeholder=""
              optionFilterProp="children"
              notFoundContent=""
              disabled={!!ownerPartnerId}
            >
              {
                  whseOwners.map(pt => (
                    <Option
                      searched={`${pt.owner_code}${pt.owner_name}`}
                      value={pt.owner_partner_id}
                      key={pt.owner_partner_id}
                    >
                      {pt.owner_code ? `${pt.owner_code} | ${pt.owner_name}` : pt.owner_name}
                    </Option>))
                }
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
