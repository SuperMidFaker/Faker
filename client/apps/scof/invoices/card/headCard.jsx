/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select, DatePicker, Card, Col, Row } from 'antd';
import { WRAP_TYPE } from 'common/constants';
import moment from 'moment';
import FormPane from 'client/components/FormPane';
import { loadSkuParams } from 'common/reducers/cwmSku';
import { getSuppliers } from 'common/reducers/cwmReceive';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const dateFormat = 'YYYY/MM/DD';
const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
    suppliers: state.cwmReceive.suppliers,
  }),
  { loadSkuParams, getSuppliers }
)
export default class HeadCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    handleOwnerChange: PropTypes.func,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.invoiceHead !== this.props.invoiceHead) {
      const { invoiceHead } = nextProps;
      if (invoiceHead) {
        this.props.loadSkuParams(invoiceHead.owner_partner_id);
        this.props.getSuppliers(this.props.defaultWhse.code, invoiceHead.owner_partner_id);
      }
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleBondedChange = (ev) => {
    if (ev.target.value === 0) {
      this.props.form.setFieldsValue({ reg_type: null });
    }
  }
  handleSelect = (value) => {
    this.props.handleOwnerChange(true, value);
    this.props.loadSkuParams(value);
    this.props.getSuppliers(this.props.defaultWhse.code, value);
  }
  render() {
    const {
      form: { getFieldDecorator }, owners, invoiceHead,
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
        <FormPane>
          <Row>
            <Col span={6}>
              <FormItem label="发票号" {...formItemLayout}>
                {getFieldDecorator('invoice_no', {
                rules: [{ type: 'object', required: true, message: 'Please select time!' }],
                initialValue: invoiceHead && invoiceHead.invoice_no,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="开票日期" {...formItemLayout}>
                {getFieldDecorator('invoice_date', {
                initialValue: (invoiceHead && invoiceHead.invoice_date) ?
                moment(new Date(invoiceHead.invoice_date)) : moment(new Date()),
              })(<DatePicker format={dateFormat} style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="购买方" {...formItemLayout}>
                {getFieldDecorator('buyer', {
                initialValue: invoiceHead && invoiceHead.buyer,
              })(<Select placeholder="选择货主" onSelect={this.handleSelect}>
                {
                    owners.map(owner =>
                      <Option value={owner.id} key={owner.id}>{owner.name}</Option>)
                  }
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="销售方" {...formItemLayout}>
                {getFieldDecorator('seller', {
                initialValue: invoiceHead && invoiceHead.seller,
              })(<Select
                allowClear
                showSearch
                showArrow
                optionFilterProp="searchText"
                notFoundContent={<a onClick={() =>
                  this.props.toggleSupplierModal(true)}
                >+ 添加供货商</a>}
              >
                {this.props.suppliers.map(supplier => <Option searchText={`${supplier.name}${supplier.code}`} value={supplier.name} key={supplier.name}>{supplier.name}</Option>)}
              </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="采购订单号" {...formItemLayout}>
                {getFieldDecorator('po_no', {
                initialValue: invoiceHead && invoiceHead.po_no,
              })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="件数/包装" {...formItemLayout}>
                <InputGroup compact>
                  <Input
                    type="number"
                    style={{ width: '50%' }}
                  />
                  <Select
                    style={{ width: '50%' }}
                    placeholder="选择包装方式"
                  >
                    {WRAP_TYPE.map(wt => (<Option value={wt.value} key={wt.value}>
                      {wt.text}</Option>))}
                  </Select>
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="总毛重" {...formItemLayout}>
                <Input
                  type="number"
                  addonAfter="KG"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="贸易方式" {...formItemLayout}>
                <Select />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="总数量" {...formItemLayout}>
                {getFieldDecorator('total_qty', {
                initialValue: invoiceHead && invoiceHead.total_qty,
              })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="总金额" {...formItemLayout}>
                {getFieldDecorator('total_amount', {
                initialValue: invoiceHead && invoiceHead.total_amount,
              })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="总净重" {...formItemLayout}>
                {getFieldDecorator('total_net_wt', {
                initialValue: invoiceHead && invoiceHead.total_net_wt,
              })(<Input
                type="number"
                addonAfter="KG"
                disabled
              />)}
              </FormItem>
            </Col>
          </Row>
        </FormPane>
      </Card>
    );
  }
}
