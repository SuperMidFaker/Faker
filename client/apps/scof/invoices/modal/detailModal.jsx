import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import { toggleDetailModal, addTemporary, setTemporary } from 'common/reducers/sofInvoice';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    visible: state.sofInvoice.detailModal.visible,
    record: state.sofInvoice.detailModal.record,
    currencies: state.cmsManifest.params.currencies,
    countries: state.cmsManifest.params.tradeCountries,
    temporaryDetails: state.sofInvoice.temporaryDetails,
  }),
  {
    toggleDetailModal, addTemporary, setTemporary,
  }
)
@Form.create()
export default class DetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    headForm: PropTypes.shape({ getFieldValue: PropTypes.func }).isRequired,
  }
  state = {
    amount: '',
    unit: '',
    currency: '',
  }
  componentWillReceiveProps(nexrProps) {
    if (nexrProps.visible !== this.props.visible && nexrProps.visible) {
      this.setState({
        amount: nexrProps.record.amount,
        unit: nexrProps.record.unit,
        currency: nexrProps.record.currency,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  submit = () => {
    const { record, temporaryDetails } = this.props;
    const { unit, currency, amount = 0 } = this.state;
    const totalQty = temporaryDetails.reduce((prev, next) => prev + Number(next.qty), 0);
    const totalAmount = temporaryDetails.reduce((prev, next) => prev + Number(next.amount), 0);
    const totalNetWt = temporaryDetails.reduce((prev, next) => prev + Number(next.net_wt), 0);
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!record.index && record.index !== 0) {
          this.props.addTemporary({
            unit,
            amount,
            currency,
            ...values,
          });
          this.props.headForm.setFieldsValue({
            total_qty: totalQty + Number(values.qty),
            total_amount: totalAmount + Number(amount),
            total_net_wt: totalNetWt + Number(values.net_wt),
          });
        } else {
          const details = [...this.props.temporaryDetails];
          const { index } = record;
          const origRecord = details[index];
          const data = {
            unit,
            amount,
            currency,
            ...values,
          };
          this.props.headForm.setFieldsValue({
            total_qty: totalQty + (Number(data.qty) - Number(origRecord.qty)),
            total_amount: totalAmount + (Number(amount) - Number(origRecord.amount)),
            total_net_wt: totalNetWt + (Number(data.net_wt) - Number(origRecord.net_wt)),
          });
          details.splice(index, 1, data);
          this.props.setTemporary(details);
        }
        this.handleCancel();
      }
    });
  }
  handleCancel = () => {
    this.props.toggleDetailModal(false);
    this.setState({
      amount: '',
      unit: '',
      currency: '',
    });
    this.props.form.resetFields();
  }
  handleQtyChange = (e) => {
    const unitPrice = this.props.form.getFieldValue('unit_price');
    const { amount } = this.state;
    if (!unitPrice && !amount) { return; }
    if (!unitPrice && amount) {
      this.props.form.setFieldsValue({ unit_price: (amount / e.target.value).toFixed(2) });
    }
  }
  handlePriceChange = (e) => {
    const orderQty = this.props.form.getFieldValue('qty');
    if (orderQty) {
      this.setState({ amount: orderQty * e.target.value });
    }
  }
  handleAmountChange = (e) => {
    const orderQty = this.props.form.getFieldValue('qty');
    this.setState({
      amount: e.target.value,
    });
    if (orderQty) {
      this.props.form.setFieldsValue({ unit_price: (e.target.value / orderQty).toFixed(2) });
    }
  }
  handleUnitChange = (e) => {
    this.setState({
      unit: e.target.value,
    });
  }
  handleCurrChange = (value) => {
    this.setState({
      currency: value,
    });
  }
  render() {
    const {
      form: { getFieldDecorator }, visible, record, currencies, countries,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal width={800} maskClosable={false} visible={visible} title="货品明细" onOk={this.submit} onCancel={this.handleCancel}>
        <Form layout="horizontal" className="form-layout-compact">
          <FormItem label="采购订单号" {...formItemLayout}>
            {getFieldDecorator('po_no', {
              initialValue: record.po_no || '',
            })(<Input />)}
          </FormItem>
          <FormItem label="货号" {...formItemLayout}>
            {getFieldDecorator('product_no', {
              initialValue: record.product_no || '',
            })(<Input />)}
          </FormItem>
          <FormItem label="商品描述" {...formItemLayout}>
            {getFieldDecorator('description', {
              initialValue: record.description || '',
            })(<Input />)}
          </FormItem>
          <FormItem label="订单数量" {...formItemLayout}>
            <InputGroup compact>
              {getFieldDecorator('qty', {
                rules: [{ required: true, message: '请输入订单数量' }],
                initialValue: record.qty || '',
              })(<Input type="number" style={{ width: '70%' }} />)}
              <Input
                placeholder="计量单位"
                style={{ width: '30%' }}
                onChange={this.handleUnitChange}
                value={this.state.unit}
              />
            </InputGroup>
          </FormItem>
          <FormItem label="净重" {...formItemLayout}>
            {getFieldDecorator('net_wt', {
              initialValue: record.net_wt || '',
            })(<Input />)}
          </FormItem>
          <FormItem label="原产国" {...formItemLayout}>
            {getFieldDecorator('orig_country', {
              initialValue: record.orig_country || '',
            })(<Select
              allowClear
              optionFilterProp="children"
              placeholder="原产国"
            >
              {countries.map(coun =>
                (<Option value={coun.cntry_co} key={coun.cntry_co}>
                  {coun.cntry_co} | {coun.cntry_name_cn}
                </Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="状态" {...formItemLayout}>
            {getFieldDecorator('status', {
              initialValue: record.status || 0,
            })(<Select>
              <Option key={0} value={0}>未发货</Option>
              <Option key={1} value={1}>已发货</Option>
            </Select>)}
          </FormItem>
          <FormItem label="金额" {...formItemLayout}>
            <InputGroup compact>
              {getFieldDecorator('unit_price', {
                initialValue: record.unit_price || '',
              })(<Input placeholder="单价" type="number" onChange={this.handlePriceChange} style={{ width: '30%' }} />)}
              <Input placeholder="总价" type="number" value={this.state.amount} onChange={this.handleAmountChange} style={{ width: '30%' }} />
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder="币制"
                style={{ width: '40%' }}
                value={this.state.currency}
                onChange={this.handleCurrChange}
              >
                {currencies.map(curr =>
                  (<Option value={curr.curr_code} key={curr.curr_code}>
                    {curr.curr_code} | {curr.curr_name}
                  </Option>))}
              </Select>
            </InputGroup>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
