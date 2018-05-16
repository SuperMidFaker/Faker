/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select, Card, Col, Row } from 'antd';
import FormPane from 'client/components/FormPane';
import { loadParams } from 'common/reducers/cmsParams';
import { loadInvoiceBuyerSellers } from 'common/reducers/sofInvoice';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    purchaseOrder: state.sofPurchaseOrders.purchaseOrder,
    buyers: state.sofInvoice.buyers,
    sellers: state.sofInvoice.sellers,
    currencies: state.cmsParams.currencies.map(currency => ({
      value: currency.curr_code,
      text: currency.curr_name,
    })),
    countries: state.cmsParams.countries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    trxnModes: state.cmsParams.trxnModes.map(trxn => ({
      value: trxn.trx_mode,
      text: trxn.trx_spec,
    })),
    transModes: state.cmsParams.transModes.map(trans => ({
      value: trans.trans_code,
      text: trans.trans_spec,
    })),
    units: state.cmsParams.units.map(unit => ({
      value: unit.unit_code,
      text: unit.unit_name,
    })),
  }),
  {
    loadInvoiceBuyerSellers,
    loadParams,
  }
)
export default class HeadCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  componentDidMount() {
    this.props.loadInvoiceBuyerSellers();
    this.props.loadParams();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  render() {
    const {
      form: { getFieldDecorator }, purchaseOrder, buyers, sellers, countries, trxnModes,
      transModes, currencies, units,
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    return (
      <Card bodyStyle={{ padding: 0 }} >
        <FormPane descendant>
          <Row>
            <Col span={6}>
              <FormItem label={this.msg('poNo')} {...formItemLayout}>
                {getFieldDecorator('po_no', {
                rules: [{ type: 'string', required: true, message: this.msg('poNoIsRequired') }],
                initialValue: purchaseOrder && purchaseOrder.po_no,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('customer')} {...formItemLayout}>
                {getFieldDecorator('customer_partner_id', {
                initialValue: (purchaseOrder && purchaseOrder.customer_partner_id),
              })(<Select allowClear showSearch optionFilterProp="children">
                {buyers.map(buyer =>
                  (<Option key={buyer.partner_id} value={buyer.partner_id}>
                    {buyer.name}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('customerCntry')} {...formItemLayout}>
                {getFieldDecorator('customer_country', {
                initialValue: purchaseOrder && purchaseOrder.customer_country,
              })(<Select allowClear showSearch optionFilterProp="children">
                {countries.map(cntry =>
                  (<Option key={cntry.value} value={cntry.value}>
                    {cntry.text}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('supplier')} {...formItemLayout}>
                {getFieldDecorator('supplier', {
                initialValue: purchaseOrder && purchaseOrder.supplier_partner_id,
              })(<Select allowClear showSearch optionFilterProp="children">
                {sellers.map(seller =>
                  (<Option key={seller.partner_id} value={seller.partner_id}>
                    {seller.name}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('supplierCntry')} {...formItemLayout}>
                {getFieldDecorator('supplier_country', {
                initialValue: purchaseOrder && purchaseOrder.supplier_country,
              })(<Select allowClear showSearch optionFilterProp="children">
                {countries.map(cntry =>
                  (<Option key={cntry.value} value={cntry.value}>
                    {cntry.text}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('trxnMode')} {...formItemLayout}>
                {getFieldDecorator('trxn_mode', {
                  initialValue: purchaseOrder && purchaseOrder.trxn_mode,
                })(<Select allowClear showSearch optionFilterProp="children">
                  {trxnModes.map(trxn =>
                    (<Option key={trxn.value} value={trxn.value}>
                      {trxn.text}
                    </Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('transMode')} {...formItemLayout}>
                {getFieldDecorator('trans_mode', {
                initialValue: purchaseOrder && purchaseOrder.trans_mode,
              })(<Select allowClear showSearch optionFilterProp="children">
                {transModes.map(trans =>
                  (<Option key={trans.value} value={trans.value}>
                    {trans.text}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('productNo')} {...formItemLayout}>
                {getFieldDecorator('product_no', {
                 rules: [{ required: true, message: this.msg('productNoIsRequired') }],
                initialValue: purchaseOrder && purchaseOrder.product_no,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('gName')} {...formItemLayout}>
                {getFieldDecorator('g_name', {
                initialValue: purchaseOrder && purchaseOrder.g_name,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('virtualWhse')} {...formItemLayout}>
                {getFieldDecorator('virtual_whse', {
                initialValue: purchaseOrder && purchaseOrder.virtual_whse,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('brand')} {...formItemLayout}>
                {getFieldDecorator('brand', {
                initialValue: purchaseOrder && purchaseOrder.brand,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('orderQty')} {...formItemLayout}>
                {getFieldDecorator('order_qty', {
                  rules: [{ required: true, message: this.msg('qtyIsRequired') }],
                initialValue: purchaseOrder && purchaseOrder.order_qty,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('unitPrice')} {...formItemLayout}>
                {getFieldDecorator('unit_price', {
                initialValue: purchaseOrder && purchaseOrder.unit_price,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('totalAmount')} {...formItemLayout}>
                {getFieldDecorator('total_amount', {
                initialValue: purchaseOrder && purchaseOrder.total_amount,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('currency')} {...formItemLayout}>
                {getFieldDecorator('currency', {
                initialValue: purchaseOrder && purchaseOrder.currency,
              })(<Select allowClear showSearch optionFilterProp="children">
                {currencies.map(currency =>
                  (<Option value={currency.value} key={currency.value}>
                    {currency.text}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('netWt')} {...formItemLayout}>
                {getFieldDecorator('net_wt', {
                initialValue: purchaseOrder && purchaseOrder.net_wt,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('wtUnit')} {...formItemLayout}>
                {getFieldDecorator('wt_unit', {
                initialValue: purchaseOrder && purchaseOrder.wt_unit,
              })(<Select allowClear showSearch optionFilterProp="children">
                {units.map(unit =>
                  (<Option key={unit.value} value={unit.value}>
                    {unit.text}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('invoiceNo')} {...formItemLayout}>
                {getFieldDecorator('invoice_no', {
                initialValue: purchaseOrder && purchaseOrder.invoice_no,
              })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </FormPane>
      </Card>
    );
  }
}
