import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideDetailModal, addTemporary, loadProducts, editTemporary } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmReceive.detailModal.visible,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    productNos: state.cwmReceive.productNos,
  }),
  { hideDetailModal, addTemporary, loadProducts, editTemporary }
)
@Form.create()
export default class AddDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    selectedOwner: PropTypes.string,
  }
  state = {
    product: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.product !== this.props.product) {
      const product = nextProps.product;
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
  }
  handleSearch = (value) => {
    const { selectedOwner } = this.props;
    this.props.loadProducts(value, selectedOwner);
  }
  submit = () => {
    const product = this.state.product;
    const edit = this.props.edit;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!edit) {
          this.props.addTemporary({
            name: product.desc_cn,
            unit: product.unit,
            unit_price: product.unit_price,
            unit_name: product.unit_name,
            product_sku: product.product_sku,
            currency: product.currency,
            currency_name: product.currency_name,
            ...values,
          });
        } else {
          this.props.editTemporary(product.index, { ...product, ...values });
        }
        this.handleCancel();
        this.setState({
          product: {},
        });
        this.props.form.setFieldsValue({
          product_no: '',
          order_qty: '',
          unit_price: '',
        });
      }
    });
  }
  handleSelect = (value) => {
    const { productNos } = this.props;
    const product = productNos.find(item => item.product_no === value);
    this.setState({ product });
  }
  render() {
    const { form: { getFieldDecorator }, visible, productNos } = this.props;
    const product = this.state.product;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal onCancel={this.handleCancel} visible={visible} title="添加明细" onOk={this.submit}>
        <Form>
          <FormItem label="商品货号" {...formItemLayout}>
            {getFieldDecorator('product_no', {
              rules: [{ required: true, message: 'Please input product_no!' }],
            })(
              <Select mode="combobox" onChange={this.handleSearch} style={{ width: '100%' }} onSelect={this.handleSelect}>
                {
                  productNos.map(data => (<Option value={data.product_no} key={data.product_no}
                    search={data.product_no}
                  >{data.product_no}</Option>)
                  )}
              </Select>
            )}
          </FormItem>
          <FormItem label="中文品名" {...formItemLayout}>
            <Input disabled value={product.desc_cn} />
          </FormItem>
          <FormItem label="sku" {...formItemLayout}>
            <Input disabled value={product.product_sku} />
          </FormItem>
          <FormItem label="订单数量" {...formItemLayout}>
            {getFieldDecorator('order_qty', {
              rules: [{ required: true, message: 'Please input order_number!' }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="主单位" {...formItemLayout}>
            <Input disabled value={product.unit_name} />
          </FormItem>
          <FormItem label="单价" {...formItemLayout}>
            <Row gutter={8}>
              <Col span={12}>
                {getFieldDecorator('unit_price', {
                  initialValue: product.unit_price,
                })(
                  <Input />
                )}
              </Col>
              <Col span={12}>
                <Input disabled value={product.currency && `${product.currency}|${product.currency_name}`} />
              </Col>
            </Row>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
