/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select, DatePicker, Card, Col, Row } from 'antd';
import moment from 'moment';
import FormPane from 'client/components/FormPane';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, WRAP_TYPE } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const dateFormat = 'YYYY/MM/DD';
const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partners: state.partner.partners,
    trxModes: state.cmsManifest.params.trxModes,
    invoiceHead: state.sofInvoice.invoiceHead,
  }),
  { loadPartners }
)
export default class HeadCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    handlePackageSelect: PropTypes.func.isRequired,
    packageType: PropTypes.string,
    editable: PropTypes.bool.isRequired,
  }
  componentWillMount() {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role: PARTNER_ROLES.CUS,
    });
  }
  handleSelect = (value) => {
    this.props.handlePackageSelect(value);
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  render() {
    const {
      form: { getFieldDecorator }, invoiceHead, partners, trxModes, packageType, editable,
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
              <FormItem label={this.msg('invoiceNo')} {...formItemLayout}>
                {getFieldDecorator('invoice_no', {
                rules: [{ type: 'string', required: true, message: 'Please select time!' }],
                initialValue: invoiceHead && invoiceHead.invoice_no,
              })(<Input disabled={!editable} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('invoiceDate')} {...formItemLayout}>
                {getFieldDecorator('invoice_date', {
                initialValue: (invoiceHead && invoiceHead.invoice_date) ?
                moment(new Date(invoiceHead.invoice_date)) : moment(new Date()),
              })(<DatePicker format={dateFormat} style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('buyer')} {...formItemLayout}>
                {getFieldDecorator('buyer', {
                initialValue: invoiceHead.buyer &&
                partners.find(partner => partner.id === Number(invoiceHead.buyer)) &&
                partners.find(partner => partner.id === Number(invoiceHead.buyer)).name,
              })(<Select
                allowClear
                showSearch
                showArrow
                optionFilterProp="children"
              >
                {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('seller')} {...formItemLayout}>
                {getFieldDecorator('seller', {
                initialValue: invoiceHead.seller &&
                partners.find(partner => partner.id === Number(invoiceHead.seller)) &&
                partners.find(partner => partner.id === Number(invoiceHead.seller)).name,
              })(<Select
                allowClear
                showSearch
                showArrow
                optionFilterProp="children"
              >
                {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('poNo')} {...formItemLayout}>
                {getFieldDecorator('po_no', {
                initialValue: invoiceHead && invoiceHead.po_no,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('packageAndNumber')} {...formItemLayout}>
                <InputGroup compact>
                  {getFieldDecorator('package_number', {
                  initialValue: invoiceHead && invoiceHead.package_number,
                })(<Input
                  type="number"
                  style={{ width: '50%' }}
                />)}
                  <Select
                    style={{ width: '50%' }}
                    placeholder={this.msg('selectPackage')}
                    onSelect={this.handleSelect}
                    value={packageType}
                  >
                    {WRAP_TYPE.map(wt => (<Option value={wt.value} key={wt.value}>
                      {wt.text}</Option>))}
                  </Select>
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('grossWt')} {...formItemLayout}>
                {getFieldDecorator('gross_wt', {
                initialValue: invoiceHead && invoiceHead.gross_wt,
              })(<Input
                type="number"
                addonAfter="KG"
              />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('tradeMode')} {...formItemLayout}>
                {getFieldDecorator('trade_mode', {
                initialValue: invoiceHead && invoiceHead.trade_mode,
              })(<Select>
                {trxModes.map(mode =>
                  (<Option key={mode.trx_mode} vaule={mode.trx_mode}>
                    {mode.trx_mode} | {mode.trx_spec}
                  </Option>))}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('totalQty')} {...formItemLayout}>
                {getFieldDecorator('total_qty', {
                initialValue: invoiceHead && invoiceHead.total_qty,
              })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('totalAmount')} {...formItemLayout}>
                {getFieldDecorator('total_amount', {
                initialValue: invoiceHead && invoiceHead.total_amount,
              })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('totalNetWt')} {...formItemLayout}>
                {getFieldDecorator('total_net_wt', {
                initialValue: invoiceHead && invoiceHead.total_net_wt,
              })(<Input
                type="number"
                addonAfter="KG"
                disabled
              />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={this.msg('category')} {...formItemLayout}>
                {getFieldDecorator('invoice_category', {
                initialValue: invoiceHead && invoiceHead.invoice_category,
              })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </FormPane>
      </Card>
    );
  }
}
