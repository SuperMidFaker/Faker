/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col, Row, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadHscodes } from 'common/reducers/cmsHsCode';
import { SPECIAL_COPNO_TERM } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    ['cop_product_no', 'src_product_no', 'hscode', 'g_name', 'en_name', 'g_model', 'element', 'g_unit_1', 'g_unit_2', 'g_unit_3',
      'unit_1', 'unit_2', 'fixed_unit', 'origin_country', 'customs_control', 'inspection_quarantine',
      'currency', 'pre_classify_no', 'remark',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
    ['unit_net_wt', 'unit_price', 'fixed_qty', 'pre_classify_start_date', 'pre_classify_end_date'].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? null : formData[fd];
    });
    init.specialMark = formData.special_mark ? formData.special_mark.split('/') : [];
    if (formData.srcNos && formData.srcNos.length > 0) {
      init.src_product_no = `${formData.cop_product_no}_${formData.srcNos.length}`;
      let num = 0;
      for (let i = 0; i < formData.srcNos.length; i++) {
        if (formData.srcNos[i] === init.src_product_no) {
          num++;
          init.src_product_no = `${formData.cop_product_no}_${formData.srcNos.length + num}`;
          i = 0;
        }
      }
    }
  }
  return init;
}
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    currencies: state.cmsTradeitem.params.currencies,
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries,
    fieldInits: getFieldInits(state.cmsTradeitem.itemData),
    hscodes: state.cmsHsCode.hscodes,
    repoId: state.cmsTradeitem.repoId,
    itemData: state.cmsTradeitem.itemData,
  }),
  { loadHscodes }
)
export default class BasicForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
    currencies: PropTypes.array,
    units: PropTypes.array,
    tradeCountries: PropTypes.array,
    hscodes: PropTypes.object,
    action: PropTypes.string.isRequired,
    repoId: PropTypes.number.isRequired,
    itemData: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
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
  handleCopNoChange = (e) => {
    this.props.form.setFieldsValue({ src_product_no: e.target.value });
  }
  handleSrcNoChange = (e) => {
    const srcNos = this.props.itemData.srcNos;
    srcNos.forEach((no) => {
      if (no === e.target.value) {
        return message.error('该源标记号已存在', 5);
      }
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, fieldInits, currencies, units, tradeCountries, hscodes, action } = this.props;
    const currencyOptions = currencies.map(curr => ({
      value: curr.curr_code,
      text: `${curr.curr_code} | ${curr.curr_name}`,
      search: `${curr.curr_code}${curr.curr_symb}${curr.curr_name}`,
    }));
    const tradeCountriesOpts = tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    }));
    return (
      <div>
        <Card bodyStyle={{ padding: 16 }}>
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('copProductNo')}>
                {getFieldDecorator('cop_product_no', {
                  rules: [{ required: true, message: '商品货号必填' }],
                  initialValue: fieldInits.cop_product_no,
                })(<Input disabled={action !== 'create'} onChange={this.handleCopNoChange} />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('srcProductNo')}>
                {getFieldDecorator('src_product_no', {
                  initialValue: fieldInits.src_product_no,
                })(<Input disabled={action !== 'newSrc'} onChange={this.handleSrcNoChange} />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('hscode')}>
                {getFieldDecorator('hscode', {
                  rules: [{ required: true, message: '商品编码必填' }],
                  initialValue: fieldInits.hscode,
                })(<Select combobox optionFilterProp="search" onChange={this.handleSearch} >
                  { hscodes.data.map(data => (<Option value={data.hscode} key={data.hscode}
                    search={data.hscode}
                  >{data.hscode}</Option>)
                    )}
                </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('specialNo')}>
                {getFieldDecorator('specialMark', {
                  initialValue: fieldInits.specialMark,
                })(<Select mode="multiple" style={{ width: '100%' }} >
                  { SPECIAL_COPNO_TERM.map(data => (<Option value={data.value} key={data.value}>{data.text}</Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('gName')}>
                {getFieldDecorator('g_name', {
                  initialValue: fieldInits.g_name,
                  rules: [{ required: true, message: '中文品名必填' }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('enName')}>
                {getFieldDecorator('en_name', {
                  initialValue: fieldInits.en_name,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('gModel')}>
                {getFieldDecorator('g_model', {
                  initialValue: fieldInits.g_model,
                  rules: [{ required: true, message: '规格型号必填' }],
                })(<Input.TextArea autosize={{ minRows: 1, maxRows: 16 }} />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('element')}>
                {getFieldDecorator('element', {
                  initialValue: fieldInits.element,
                })(<Input.TextArea autosize={{ minRows: 1, maxRows: 16 }} disabled />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('customsControl')}>
                {getFieldDecorator('customs_control', {
                  initialValue: fieldInits.customs_control,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('inspQuarantine')}>
                {getFieldDecorator('inspection_quarantine', {
                  initialValue: fieldInits.inspection_quarantine,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('unit1')}>
                {getFieldDecorator('unit_1', {
                  initialValue: fieldInits.unit_1,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('unit2')}>
                {getFieldDecorator('unit_2', {
                  initialValue: fieldInits.unit_2,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('gUnit1')}>
                {getFieldDecorator('g_unit_1', {
                  initialValue: fieldInits.g_unit_1,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('gUnit2')}>
                {getFieldDecorator('g_unit_2', {
                  initialValue: fieldInits.g_unit_2,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('gUnit3')}>
                {getFieldDecorator('g_unit_3', {
                  initialValue: fieldInits.g_unit_3,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unitNetWt')}>
                {getFieldDecorator('unit_net_wt', {
                  initialValue: fieldInits.unit_net_wt,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unitPrice')}>
                {getFieldDecorator('unit_price', {
                  initialValue: fieldInits.unit_price,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('currency')}>
                {getFieldDecorator('currency', {
                  initialValue: fieldInits.currency,
                })(
                  <Select showSearch showArrow optionFilterProp="search">
                    {
                      currencyOptions.map(data => (
                        <Option key={data.value} search={`${data.search}`} >
                          {`${data.text}`}
                        </Option>)
                      )}
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('fixedQty')}>
                {getFieldDecorator('fixed_qty', {
                  initialValue: fieldInits.fixed_qty,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('fixedUnit')}>
                {getFieldDecorator('fixed_unit', {
                  initialValue: fieldInits.fixed_unit,
                })(<Select showSearch showArrow optionFilterProp="search">
                  {
                    units.map(gt =>
                      <Option key={gt.value} search={`${gt.value}${gt.text}`}>{`${gt.value} | ${gt.text}`}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('origCountry')}>
                {getFieldDecorator('origin_country', {
                  initialValue: fieldInits.origin_country,
                })(
                  <Select showSearch showArrow optionFilterProp="search">
                    {
                      tradeCountriesOpts.map(data => (
                        <Option key={data.value} search={`${data.search}`} >
                          {`${data.text}`}
                        </Option>)
                      )}
                  </Select>
                  )}
              </FormItem>
            </Col>

          </Row>
        </Card>
      </div>
    );
  }
}
