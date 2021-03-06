import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import { hideDetailModal, addTemporary, loadProducts, editTemporary, clearProductNos } from 'common/reducers/cwmReceive';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    visible: state.cwmReceive.detailModal.visible,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    productNos: state.cwmReceive.productNos,
    products: state.cwmReceive.products,
    units: state.cwmSku.params.units,
    currencies: state.cwmSku.params.currencies,
  }),
  {
    hideDetailModal, addTemporary, loadProducts, editTemporary, clearProductNos,
  }
)
@Form.create()
export default class AddDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    selectedOwner: PropTypes.number,
    units: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
    })),
  }
  state = {
    product: {},
    amount: 0,
    skus: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.product !== this.props.product) {
      const { product } = nextProps;
      product.desc_cn = product.name;
      this.setState({
        product,
      });
      this.props.form.setFieldsValue({
        product_no: product.product_no,
        order_qty: product.order_qty,
        unit_price: product.unit_price,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.props.hideDetailModal();
    this.setState({
      product: {},
      amount: 0,
      skus: [],
    });
    this.props.form.setFieldsValue({
      product_no: '',
      order_qty: '',
      unit_price: '',
    });
    this.props.clearProductNos();
  }
  handleSearch = (value) => {
    if (value.length >= 3) {
      const { selectedOwner } = this.props;
      this.props.loadProducts(value, selectedOwner);
    }
  }
  submit = () => {
    const { product } = this.state;
    const { edit } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!edit) {
          this.props.addTemporary({
            name: product.desc_cn,
            unit: product.unit,
            unit_price: product.unit_price,
            product_sku: product.product_sku,
            currency: product.currency && Number(product.currency),
            amount: this.state.amount,
            ...values,
          });
        } else {
          this.props.editTemporary(product.index, {
            ...product,
            ...values,
            amount: this.state.amount ? this.state.amount : product.amount,
          });
        }
        this.handleCancel();
        this.setState({
          product: {},
          amount: 0,
        });
        this.props.form.setFieldsValue({
          product_no: '',
          order_qty: '',
          unit_price: '',
        });
      }
      this.props.clearProductNos();
    });
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
    const orderQty = this.props.form.getFieldValue('order_qty');
    if (orderQty) {
      this.setState({ amount: orderQty * e.target.value });
    }
  }
  handleAmountChange = (e) => {
    const orderQty = this.props.form.getFieldValue('order_qty');
    this.setState({
      amount: e.target.value,
    });
    if (orderQty) {
      this.props.form.setFieldsValue({ unit_price: (e.target.value / orderQty).toFixed(2) });
    }
  }
  handleSelect = (value) => {
    const { products } = this.props;
    const filterProducts = products.filter(item => item.product_no === value);
    const skus = filterProducts.map(fp => fp.product_sku);
    this.setState({
      product: filterProducts[0],
      skus,
    });
  }
  handleUnitChange = (value) => {
    const unit = this.props.units.filter(un => un.code === value)[0];
    if (unit) {
      const product = { ...this.state.product, unit: unit.code };
      this.setState({ product });
    }
  }
  handleCurrChange = (value) => {
    const curr = this.props.currencies.filter(cu => cu.code === value)[0];
    if (curr) {
      const product = { ...this.state.product, currency: curr.code, currency_name: curr.name };
      this.setState({ product });
    }
  }
  handleSelectSku = (value) => {
    const { products } = this.props;
    const product = products.find(p => p.product_sku === value);
    this.setState({
      product,
    });
  }
  handleDescChange = (e) => {
    const product = { ...this.state.product };
    this.setState({
      product: { ...product, desc_cn: e.target.value },
    });
  }
  render() {
    const {
      form: { getFieldDecorator }, visible, productNos, units, currencies,
    } = this.props;
    const { skus, product } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal width={800} maskClosable={false} visible={visible} title="货品明细" onOk={this.submit} onCancel={this.handleCancel}>
        <Form layout="horizontal" className="form-layout-compact">
          <FormItem label="商品货号" {...formItemLayout}>
            {getFieldDecorator('product_no', {
              rules: [{ required: true, message: '请输入货号' }],
            })(<Select mode="combobox" placeholder="请至少输入三位货号" onChange={this.handleSearch} style={{ width: '100%' }} onSelect={this.handleSelect}>
              {productNos.map(productNo => (<Option value={productNo} key={productNo}>
                {productNo}</Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="SKU" {...formItemLayout}>
            <Select value={product.product_sku} onSelect={this.handleSelectSku}>
              {skus.map(sku => (<Option value={sku} key={sku}>{sku}</Option>))}
            </Select>
          </FormItem>
          <FormItem label="中文品名" {...formItemLayout}>
            <Input value={product.desc_cn} onChange={this.handleDescChange} />
          </FormItem>
          <FormItem label="订单数量" {...formItemLayout}>
            <InputGroup compact>
              {getFieldDecorator('order_qty', {
                rules: [{ required: true, message: '请输入订单数量' }],
              })(<Input type="number" style={{ width: '70%' }} onChange={this.handleQtyChange} />)}
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder="计量单位"
                value={product.unit}
                style={{ width: '30%' }}
                onChange={this.handleUnitChange}
              >
                {units.map(unit => (<Option value={unit.code} key={unit.code}>
                  {unit.code} | {unit.name}</Option>))}
              </Select>
            </InputGroup>
          </FormItem>
          <FormItem label="库别" {...formItemLayout}>
            {getFieldDecorator('virtual_whse', {
              initialValue: product.virtual_whse,
            })(<Input />)}
          </FormItem>
          <FormItem label="采购订单号" {...formItemLayout}>
            {getFieldDecorator('po_no', {
              initialValue: product.po_no,
            })(<Input />)}
          </FormItem>
          <FormItem label="集装箱号" {...formItemLayout}>
            {getFieldDecorator('container_no', {
              initialValue: product.container_no,
            })(<Input />)}
          </FormItem>
          <FormItem label="金额" {...formItemLayout}>
            <InputGroup compact>
              {getFieldDecorator('unit_price', {
                initialValue: product.unit_price,
              })(<Input placeholder="单价" type="number" onChange={this.handlePriceChange} style={{ width: '30%' }} />)}
              <Input placeholder="总价" type="number" value={this.state.amount || product.amount} onChange={this.handleAmountChange} style={{ width: '30%' }} />
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder="币制"
                value={product.currency && String(product.currency)}
                style={{ width: '40%' }}
                onChange={this.handleCurrChange}
              >
                {currencies.map(curr => (<Option value={curr.code} key={curr.code}>
                  {curr.code} | {curr.name}</Option>))}
              </Select>
            </InputGroup>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
