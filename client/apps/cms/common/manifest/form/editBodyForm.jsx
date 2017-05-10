/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../form/message.i18n';
import { loadHscodes } from 'common/reducers/cmsHsCode';
import { getItemForBody } from 'common/reducers/cmsTradeitem';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

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
  }),
  { loadHscodes, getItemForBody }
)
export default class EditBodyForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    editBody: PropTypes.object,
    form: PropTypes.object.isRequired,
    currencies: PropTypes.array,
    units: PropTypes.array,
    tradeCountries: PropTypes.array,
    hscodes: PropTypes.object,
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
        const unitg = this.props.units.filter(unit => unit.value === item.g_unit)[0];
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
          fixed_unit: item.fixed_unit,
          fixed_qty: item.fixed_qty,
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
        });
      }
    }
    if (this.props.hscodes !== nextProps.hscodes) {
      if (nextProps.hscodes.data.length === 1) {
        const hscode = nextProps.hscodes.data[0];
        const firstUnit = this.props.units.filter(unit => unit.text === hscode.first_unit)[0];
        const unit1 = firstUnit ? firstUnit.value : '';
        const secondUnit = this.props.units.filter(unit => unit.text === hscode.second_unit)[0];
        const unit2 = secondUnit ? secondUnit.value : '';
        this.props.form.setFieldsValue({
          g_name: hscode.product_name,
          element: hscode.declared_elements,
          unit_1: unit1,
          unit_2: unit2,
          customs_control: hscode.customs,
          inspection_quarantine: hscode.inspection,
        });
      } else {
        this.props.form.setFieldsValue({
          g_name: '',
          element: '',
          unit_1: '',
          unit_2: '',
          customs_control: '',
          inspection_quarantine: '',
        });
      }
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
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, editBody, currencies, units, tradeCountries, hscodes, exemptions } = this.props;
    return (
      <div className="form-layout-compact">
        <Row gutter={16}>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('copGNo')}>
              {getFieldDecorator('cop_g_no', {
                rules: [{ required: true, message: '商品货号必填' }],
                initialValue: editBody.cop_g_no,
              })(<Input onChange={this.handleCopGNoChange} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('emGNo')}>
              {getFieldDecorator('em_g_no', {
                initialValue: editBody.em_g_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('codeT')}>
              {getFieldDecorator('codes', {
                rules: [{ required: true, message: '商品编码必填' }],
                initialValue: editBody.codes,
              })(<Select combobox optionFilterProp="search" onChange={this.handleSearch} style={{ width: '100%' }}>
                {
                  hscodes.data.map(data => (<Option value={data.hscode} key={data.hscode}
                    search={data.hscode}
                  >{data.hscode}</Option>)
                  )}
              </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('gName')}>
              {getFieldDecorator('g_name', {
                rules: [{ required: true, message: '商品名称必填' }],
                initialValue: editBody.g_name,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('gModel')}>
              {getFieldDecorator('g_model', {
                initialValue: editBody.g_model,
              })(<Input type="textarea" autosize={{ minRows: 1, maxRows: 16 }} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={24}>
            <FormItem label={this.msg('element')}>
              {getFieldDecorator('element', {
                initialValue: editBody.element,
              })(<Input type="textarea" autosize={{ minRows: 1, maxRows: 16 }} disabled />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('quantity')}>
              {getFieldDecorator('g_qty', {
                rules: [{ required: true, message: '申报数量必填' }],
                initialValue: editBody.g_qty,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('unit')}>
              {getFieldDecorator('g_unit', {
                rules: [{ required: true, message: '申报单位必填' }],
                initialValue: editBody.g_unit,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('decPrice')}>
              {getFieldDecorator('dec_price', {
                initialValue: editBody.dec_price,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('decTotal')}>
              {getFieldDecorator('trade_total', {
                rules: [{ required: true, message: '申报总价必填' }],
                initialValue: editBody.trade_total,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('currency')}>
              {getFieldDecorator('trade_curr', {
                rules: [{ required: true, message: '币制必填' }],
                initialValue: editBody.trade_curr,
              })(
                <Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                  {
                    currencies.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>)
                    )}
                </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('exemptionWay')}>
              {getFieldDecorator('duty_mode', {
                rules: [{ required: true, message: '征免方式必填' }],
                initialValue: editBody.duty_mode,
              })(
                <Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                  {
                    exemptions.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>)
                    )}
                </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('ecountry')}>
              {getFieldDecorator('dest_country', {
                rules: [{ required: true, message: '目的国必填' }],
                initialValue: editBody.dest_country,
              })(
                <Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                  {
                    tradeCountries.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>)
                    )}
                </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('icountry')}>
              {getFieldDecorator('orig_country', {
                rules: [{ required: true, message: '原产国必填' }],
                initialValue: editBody.orig_country,
              })(
                <Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                  {
                    tradeCountries.map(data => (
                      <Option key={data.value} search={`${data.search}`} >
                        {`${data.text}`}
                      </Option>)
                    )}
                </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('grosswt')}>
              {getFieldDecorator('gross_wt', {
                initialValue: editBody.gross_wt,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('netwt')}>
              {getFieldDecorator('wet_wt', {
                rules: [{ required: true, message: '净重必填' }],
                initialValue: editBody.wet_wt,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('qtyPcs')}>
              {getFieldDecorator('qty_pcs', {
                initialValue: editBody.qty_pcs,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('unitPcs')}>
              {getFieldDecorator('unit_pcs', {
                initialValue: editBody.unit_pcs,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('qty1')}>
              {getFieldDecorator('qty_1', {
                initialValue: editBody.qty_1,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('unit1')}>
              {getFieldDecorator('unit_1', {
                initialValue: editBody.unit_1,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('qty2')}>
              {getFieldDecorator('qty_2', {
                initialValue: editBody.qty_2,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={6}>
            <FormItem label={this.msg('unit2')}>
              {getFieldDecorator('unit_2', {
                initialValue: editBody.unit_2,
              })(<Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }}>
                {
                  units.map(gt =>
                    <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={this.msg('versionNo')}>
              {getFieldDecorator('version_no', {
                initialValue: editBody.version_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={this.msg('processingFees')}>
              {getFieldDecorator('processing_fees', {
                initialValue: editBody.processing_fees,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
