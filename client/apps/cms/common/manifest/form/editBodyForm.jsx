/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Select, Input, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';

import { loadHscodes } from 'common/reducers/cmsHsCode';
import { getItemForBody } from 'common/reducers/cmsTradeitem';
import { formatMsg } from '../../message.i18n';


const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billHead: state.cmsManifest.billHead,
    currencies: state.cmsManifest.params.currencies.map(curr => ({
      value: curr.curr_code,
      text: `${curr.curr_code} | ${curr.curr_name}`,
      search: `${curr.curr_code}${curr.curr_symb}${curr.curr_name}`,
    })),
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
      search: `${ep.value}${ep.text}`,
    })),
    tradeCountries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    })),
    hscodes: state.cmsHsCode.hscodes,
    bodyItem: state.cmsTradeitem.bodyItem,
    billRule: state.cmsManifest.billRule,
  }),
  { loadHscodes, getItemForBody }
)
export default class EditBodyForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    editBody: PropTypes.shape({
      codes: PropTypes.string,
      g_name: PropTypes.string,
    }),
    form: PropTypes.shape({
      getFieldDecorator: PropTypes.func,
      setFieldsValue: PropTypes.func,
    }).isRequired,
    currencies: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      text: PropTypes.string,
    })),
    units: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      text: PropTypes.string,
    })),
    tradeCountries: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      text: PropTypes.string,
    })),
    hscodes: PropTypes.shape({
      pageSize: PropTypes.number,
      current: PropTypes.number,
    }),
    billSeqNo: PropTypes.string,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.bodyItem !== this.props.bodyItem) {
      const item = nextProps.bodyItem;
      if (item) {
        const unit1 = this.props.units.filter(unit => unit.value === item.unit_1)[0];
        const unit1Val = unit1 ? unit1.value : '';
        const unit2 = this.props.units.filter(unit => unit.value === item.unit_2)[0];
        const unit2Val = unit2 ? unit2.value : '';
        const unitg = this.props.units.filter(unit =>
          unit.value === item.g_unit || unit.text === item.g_unit)[0];
        const gunitVal = unitg ? unitg.value : '';
        this.props.form.setFieldsValue({
          codes: item.hscode,
          g_name: item.g_name,
          g_model: item.g_model,
          element: item.element,
          g_unit: gunitVal,
          unit_1: unit1Val,
          unit_2: unit2Val,
          trade_curr: item.trade_curr,
          orig_country: item.orig_country,
          dest_country: item.dest_country,
          duty_mode: item.duty_mode,
        });
      } else {
        this.props.form.setFieldsValue({
          codes: '',
          g_name: '',
          g_model: '',
          element: '',
          g_unit: '',
          unit_1: '',
          unit_2: '',
          trade_curr: '',
          orig_country: '',
          dest_country: '',
          duty_mode: '',
        });
      }
    }
    if (this.props.hscodes !== nextProps.hscodes) {
      if (nextProps.hscodes.data.length === 1) {
        const hscode = nextProps.hscodes.data[0];
        const ruleGunit = this.props.billRule.rule_gunit_num;
        const firstUnit = this.props.units.filter(unit => unit.text === hscode.first_unit)[0];
        const unit1 = firstUnit ? firstUnit.value : '';
        const secondUnit = this.props.units.filter(unit => unit.text === hscode.second_unit)[0];
        const unit2 = secondUnit ? secondUnit.value : '';
        const hsGunit = this.props.units.filter(unit => unit.text === hscode[`${ruleGunit}`])[0];
        const gunit = hsGunit ? hsGunit.value : '';
        this.props.form.setFieldsValue({
          g_name: hscode.product_name,
          element: hscode.declared_elements,
          unit_1: unit1,
          unit_2: unit2,
          g_unit: gunit,
          customs_control: hscode.customs,
          inspection_quarantine: hscode.inspection,
        });
      } else {
        this.props.form.setFieldsValue({
          g_name: '',
          element: '',
          unit_1: '',
          unit_2: '',
          g_unit: '',
          customs_control: '',
          inspection_quarantine: '',
        });
      }
    }
  }
  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.stopPropagation();
      event.preventDefault();
      const inputs = document.forms[0].elements;
      for (let i = 0; i < inputs.length; i++) {
        if (i === (inputs.length - 1)) {
          inputs[0].focus();
          inputs[0].select();
          break;
        } else if (event.target === inputs[i]) {
          inputs[i + 1].focus();
          inputs[i + 1].select();
          break;
        }
      }
    } else if (event.keyCode === 8) {
      event.target.select();
    }
  }
  handleSearch = (value) => {
    const { hscodes } = this.props;
    this.props.loadHscodes({
      tenantId: this.props.tenantId,
      pageSize: hscodes.pageSize,
      current: hscodes.current,
      searchText: value,
    });
  }
  handleCopGNoChange = (ev) => {
    const { billHead, tenantId, billSeqNo } = this.props;
    this.props.getItemForBody({
      tenantId,
      billSeqNo,
      delgNo: billHead.delg_no,
      copProdNo: ev.target.value,
    });
  }
  handleTradeTotChange = (ev) => {
    const qty = this.props.form.getFieldValue('g_qty');
    if (!isNaN(qty) && qty > 0) { // eslint-disable-line
      const decPrice = Number(ev.target.value / qty);
      this.props.form.setFieldsValue({ dec_price: decPrice });
    }
  }
  handleDecPriceChange = (ev) => {
    const qty = this.props.form.getFieldValue('g_qty');
    if (!isNaN(qty)) { // eslint-disable-line
      const digits = ev.target.value.toString().split('.')[1];
      const decimal = digits ? digits.length : 0;
      const tradeTot = Number(ev.target.value * qty).toFixed(decimal);
      this.props.form.setFieldsValue({ trade_total: tradeTot });
    }
  }
  msg = formatMsg(this.props.intl)
  render() {
    const {
      form: { getFieldDecorator }, editBody, currencies, units, tradeCountries, hscodes, exemptions,
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
    };
    const formItemSpan2Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const formItemSpan4Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 22 },
      },
    };
    return (
      <Form layout="horizontal" hideRequiredMark className="form-layout-multi-col">
        <Row gutter={16}>
          <Col sm={24} lg={12}>
            <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('copGNo')}>
              {getFieldDecorator('cop_g_no', {
                rules: [{ required: true, message: '商品货号必填' }],
                initialValue: editBody.cop_g_no,
              })(<Input onChange={this.handleCopGNoChange} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('emGNo')}>
              {getFieldDecorator('em_g_no', {
                initialValue: editBody.em_g_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem {...formItemSpan4Layout} colon={false} label={this.msg('enName')}>
              {getFieldDecorator('en_name', {
                initialValue: editBody.en_name,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('codeT')}>
              {getFieldDecorator('codes', {
                initialValue: editBody.codes,
              })(<Select mode="combobox" optionFilterProp="search" onChange={this.handleSearch} style={{ width: '100%' }}>
                {
                  hscodes.data.map(data => (<Option
                    value={data.hscode}
                    key={data.hscode}
                    search={data.hscode}
                  >{data.hscode}
                  </Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('gName')}>
              {getFieldDecorator('g_name', {
                initialValue: editBody.g_name,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem {...formItemSpan4Layout} colon={false} label={this.msg('gModel')}>
              {getFieldDecorator('g_model', {
                initialValue: editBody.g_model,
              })(<Input.TextArea autosize={{ minRows: 1, maxRows: 16 }} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem {...formItemSpan4Layout} colon={false} label={this.msg('element')}>
              {getFieldDecorator('element', {
                initialValue: editBody.element,
              })(<Input.TextArea autosize={{ minRows: 1, maxRows: 16 }} disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('quantity')}>
              {getFieldDecorator('g_qty', {
                initialValue: editBody.g_qty,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('unit')}>
              {getFieldDecorator('g_unit', {
                initialValue: editBody.g_unit,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('decPrice')}>
              {getFieldDecorator('dec_price', {
                initialValue: editBody.dec_price,
              })(<Input onChange={this.handleDecPriceChange} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} {...formItemLayout} label={this.msg('decTotal')}>
              {getFieldDecorator('trade_total', {
                rules: [{ required: true, message: '申报总价必填' }],
                initialValue: editBody.trade_total,
              })(<Input onChange={this.handleTradeTotChange} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('currency')}>
              {getFieldDecorator('trade_curr', {
                initialValue: editBody.trade_curr,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                    currencies.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('exemptionWay')}>
              {getFieldDecorator('duty_mode', {
                rules: [{ required: true, message: '征免方式必填' }],
                initialValue: editBody.duty_mode,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                    exemptions.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('destCountry')}>
              {getFieldDecorator('dest_country', {
                rules: [{ required: true, message: '目的国必填' }],
                initialValue: editBody.dest_country,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                    tradeCountries.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('origCountry')}>
              {getFieldDecorator('orig_country', {
                initialValue: editBody.orig_country,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                    tradeCountries.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>))}
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('grosswt')}>
              {getFieldDecorator('gross_wt', {
                initialValue: editBody.gross_wt,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('netwt')}>
              {getFieldDecorator('wet_wt', {
                initialValue: editBody.wet_wt,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('qtyPcs')}>
              {getFieldDecorator('qty_pcs', {
                initialValue: editBody.qty_pcs,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('unitPcs')}>
              {getFieldDecorator('unit_pcs', {
                initialValue: editBody.unit_pcs,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('qty1')}>
              {getFieldDecorator('qty_1', {
                initialValue: editBody.qty_1,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('unit1')}>
              {getFieldDecorator('unit_1', {
                initialValue: editBody.unit_1,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('qty2')}>
              {getFieldDecorator('qty_2', {
                initialValue: editBody.qty_2,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem {...formItemLayout} colon={false} label={this.msg('unit2')}>
              {getFieldDecorator('unit_2', {
                initialValue: editBody.unit_2,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>)
                }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} lg={12}>
            <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('versionNo')}>
              {getFieldDecorator('version_no', {
                initialValue: editBody.version_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem {...formItemSpan2Layout} colon={false} label={this.msg('processingFees')}>
              {getFieldDecorator('processing_fees', {
                initialValue: editBody.processing_fees,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
