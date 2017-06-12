import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideDetailModal, addDetial, loadProducts } from 'common/reducers/cwmReceive';

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
  { hideDetailModal, addDetial, loadProducts }
)
@Form.create()
export default class AddDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.props.hideDetailModal();
  }
  handleSearch = (value) => {
    this.props.loadProducts(value);
  }
  submit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.addDetial(values);
        this.handleCancel();
      }
    });
  }
  handleSelect = (value) => {
    const { productNos } = this.props;
    const product = productNos.find(item => item.product_no === value);
    this.props.form.setFieldsValue({
      desc_cn: product.desc_cn,
      unit_name: product.unit_name,
      unit_price: product.unit_price,
      product_sku: product.product_sku,
      currency: product.currency_name,
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible, productNos } = this.props;
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
              <Select combobox optionFilterProp="search" onChange={this.handleSearch} style={{ width: '100%' }} onSelect={this.handleSelect}>
                {
                  productNos.map(data => (<Option value={data.product_no} key={data.product_no}
                    search={data.product_no}
                  >{data.product_no}</Option>)
                  )}
              </Select>
            )}
          </FormItem>
          <FormItem label="中文品名" {...formItemLayout}>
            {getFieldDecorator('desc_cn', {
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem label="sku" {...formItemLayout}>
            {getFieldDecorator('product_sku', {
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem label="订单数量" {...formItemLayout}>
            {getFieldDecorator('qty', {
              rules: [{ required: true, message: 'Please input order_number!' }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="主单位" {...formItemLayout}>
            {getFieldDecorator('unit_name', {
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem label="单价" {...formItemLayout}>
            <Row gutter={8}>
              <Col span={12}>
                {getFieldDecorator('unit_price', {
                  rules: [{ required: true, message: 'Please input unit_price!' }],
                })(
                  <Input />
                )}
              </Col>
              <Col span={12}>
                {getFieldDecorator('currency', {
                  rules: [{ required: true, message: 'Please input currency!' }],
                })(
                  <Input disabled />
                )}
              </Col>
            </Row>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
