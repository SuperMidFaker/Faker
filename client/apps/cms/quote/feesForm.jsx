import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { formatMsg } from './message.i18n';
import { DECL_I_TYPE, DECL_E_TYPE, TRANS_MODE, INVOICE_TYPE, CMS_QUOTE_PERMISSION } from 'common/constants';
import { Form, Select, Radio, Input, InputNumber, Col, Row } from 'antd';


const RadioGroup = Radio.Group;
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
function getFieldInits(quoteData, tenantId) {
  const init = {};
  if (quoteData) {
    let isBase = false;
    if (!quoteData.send_tenant_id) {
      init.tariff_kind = '销售基准价';
      isBase = true;
    } else if (!quoteData.recv_tenant_id) {
      init.tariff_kind = '成本基准价';
      isBase = true;
    } else if (quoteData.send_tenant_id === tenantId) {
      init.tariff_kind = '成本价';
      init.partner = quoteData.recv_tenant_name;
    } else if (quoteData.recv_tenant_id === tenantId) {
      init.tariff_kind = '销售价';
      init.partner = quoteData.send_tenant_name;
    }
    if (quoteData.create_tenant_id === tenantId && !isBase) {
      init.edit_permission = true;
      init.permission = quoteData.partner_permission || 1;
    }
    init.invoice_type = quoteData.invoice_type;
    init.decl_item_per_sheet = quoteData.decl_item_per_sheet;
    init.ciq_item_per_sheet = quoteData.ciq_item_per_sheet;
    [
      'decl_way_code', 'trans_mode',
    ].forEach((qd) => {
      init[qd] = quoteData[qd] || [];
    });
  }
  return init;
}
@injectIntl
@connect(state => ({
  fieldInits: getFieldInits(state.cmsQuote.quoteData, state.account.tenantId),
}), )
export default class FeesForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    fieldInits: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    action: PropTypes.oneOf(['create', 'edit', 'view']),
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, fieldInits, action } = this.props;
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    let readOnly = false;
    if (action === 'view') {
      readOnly = true;
    }
    return (
      <div style={{ padding: 12 }}>
        <Row>
          <Col sm={8} md={8}>
            <FormItem label={this.msg('tariffKinds')} {...formItemLayout}>
              <Input value={fieldInits.tariff_kind} readOnly />
            </FormItem>
          </Col>
          <Col sm={8} md={8}>
            <FormItem label={this.msg('partnerLabel')} {...formItemLayout}>
              <Input value={fieldInits.partner} readOnly />
            </FormItem>
          </Col>
          {
            fieldInits.edit_permission &&
            <Col sm={8} md={8}>
              <FormItem label={this.msg('partnerPermission')} {...formItemLayout}>
                {getFieldDecorator('permission', {
                  initialValue: fieldInits.permission,
                })(<RadioGroup disabled={readOnly} >
                  <Radio value={CMS_QUOTE_PERMISSION.viewable}>{this.msg('permissionView')}</Radio>
                  <Radio value={CMS_QUOTE_PERMISSION.editable}>{this.msg('permissionEdit')}</Radio>
                </RadioGroup>)}
              </FormItem>
            </Col>
          }
        </Row>
        <Row>
          <Col sm={8} md={16}>
            <FormItem label={this.msg('declareWay')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {getFieldDecorator('decl_way_code', {
                rules: [{ type: 'array' }],
                initialValue: fieldInits.decl_way_code,
              })(<Select mode="multiple" style={{ width: '100%' }} disabled={readOnly} >
                {
                    DECL_TYPE.map(dw =>
                      <Option value={dw.key} key={dw.key}>{dw.value}</Option>)
                  }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={8} md={8}>
            <FormItem label={this.msg('transMode')} {...formItemLayout} >
              {getFieldDecorator('trans_mode', {
                rules: [{ type: 'array' }],
                initialValue: fieldInits.trans_mode,
              })(<Select mode="multiple" style={{ width: '100%' }} disabled={readOnly} >
                {
                    TRANS_MODE.map(tr =>
                      <Option value={tr.value} key={tr.value}>{tr.text}</Option>)
                  }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8} md={8}>
            <FormItem label={this.msg('declItemQuantity')} {...formItemLayout}>
              {getFieldDecorator('decl_item_per_sheet', {
                rules: [{ required: true, message: '品项数必填', type: 'number' }],
                initialValue: fieldInits.decl_item_per_sheet,
              })(<InputNumber style={{ width: '100%' }} readOnly={readOnly} />)}
            </FormItem>
          </Col>
          <Col sm={8} md={8}>
            <FormItem label={this.msg('ciqItemQuantity')} {...formItemLayout}>
              {getFieldDecorator('ciq_item_per_sheet', {
                rules: [{ required: true, message: '品项数必填', type: 'number' }],
                initialValue: fieldInits.ciq_item_per_sheet,
              })(<InputNumber style={{ width: '100%' }} readOnly={readOnly} />)}
            </FormItem>
          </Col>
          <Col sm={8} md={8}>
            <FormItem label={this.msg('invoiceType')} {...formItemLayout} >
              {getFieldDecorator('invoice_type', {
                rules: [{ required: true, message: '开票类型必选', type: 'number' }],
                initialValue: fieldInits.invoice_type,
              })(<Select style={{ width: '100%' }} disabled={readOnly} >
                {
                    INVOICE_TYPE.map(inv =>
                      <Option value={inv.value} key={inv.value}>{inv.text}</Option>)
                  }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
