/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col, Row, DatePicker } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadHscodes } from 'common/reducers/cmsHsCode';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function getFieldInits(formData) {
  const init = {};
  if (formData) {
    ['cop_product_no', 'hscode', 'g_name', 'g_model', 'element', 'g_unit_1', 'g_unit_2', 'g_unit_3',
      'unit_1', 'unit_2', 'fixed_unit', 'origin_country', 'customs_control', 'inspection_quarantine',
      'currency', 'pre_classify_no', 'remark',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
    ['unit_net_wt', 'unit_price', 'fixed_qty', 'pre_classify_start_date', 'pre_classify_end_date'].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? null : formData[fd];
    });
  }
  return init;
}
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    currencies: state.cmsTradeitem.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    fieldInits: getFieldInits(state.cmsTradeitem.itemData),
    hscodes: state.cmsHsCode.hscodes,
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
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.hscodes !== nextProps.hscodes) {
      if (nextProps.hscodes.data.length === 1) {
        const hscode = nextProps.hscodes.data[0];
        this.props.form.setFieldsValue({
          g_name: hscode.product_name,
          element: hscode.declared_elements,
          unit_1: hscode.first_unit,
          unit_2: hscode.second_unit,
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
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, fieldInits, currencies, units, tradeCountries, hscodes } = this.props;
    return (
      <div>
        <Card bodyStyle={{ padding: 16 }}>
          <Row>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('copProductNo')} {...formItemLayout}>
                {getFieldDecorator('cop_product_no', {
                  rules: [{ required: true, message: '商品货号必填' }],
                  initialValue: fieldInits.cop_product_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('hscode')} {...formItemLayout}>
                {getFieldDecorator('hscode', {
                  rules: [{ required: true, message: '商品编码必填' }],
                  initialValue: fieldInits.hscode,
                })(<Select combobox optionFilterProp="search" onChange={this.handleSearch} >
                  {
                      hscodes.data.map(data => (<Option value={data.hscode} key={data.hscode}
                        search={data.hscode}
                      >{data.hscode}</Option>)
                      )}
                </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('gName')} {...formItemLayout}>
                {getFieldDecorator('g_name', {
                  initialValue: fieldInits.g_name,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={16}>
              <FormItem label={this.msg('gModel')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                {getFieldDecorator('g_model', {
                  initialValue: fieldInits.g_model,
                })(<Input type="textarea" autosize={{ minRows: 1, maxRows: 16 }} />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('customsControl')} {...formItemLayout}>
                {getFieldDecorator('customs_control', {
                  initialValue: fieldInits.customs_control,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={16}>
              <FormItem label={this.msg('element')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                {getFieldDecorator('element', {
                  initialValue: fieldInits.element,
                })(<Input type="textarea" autosize={{ minRows: 1, maxRows: 16 }} disabled />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('inspQuarantine')} {...formItemLayout}>
                {getFieldDecorator('inspection_quarantine', {
                  initialValue: fieldInits.inspection_quarantine,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unit1')} {...formItemLayout}>
                {getFieldDecorator('unit_1', {
                  initialValue: fieldInits.unit_1,
                })(<Select>
                  {
                    units.map(gt =>
                      <Option value={gt.text} key={gt.value}>{gt.text}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unit2')} {...formItemLayout}>
                {getFieldDecorator('unit_2', {
                  initialValue: fieldInits.unit_2,
                })(<Select>
                  {
                    units.map(gt =>
                      <Option value={gt.text} key={gt.value}>{gt.text}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('gUnit1')} {...formItemLayout}>
                {getFieldDecorator('g_unit_1', {
                  initialValue: fieldInits.g_unit_1,
                })(<Select>
                  {
                    units.map(gt =>
                      <Option value={gt.text} key={gt.value}>{gt.text}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('gUnit2')} {...formItemLayout}>
                {getFieldDecorator('g_unit_2', {
                  initialValue: fieldInits.g_unit_2,
                })(<Select>
                  {
                    units.map(gt =>
                      <Option value={gt.text} key={gt.value}>{gt.text}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('gUnit3')} {...formItemLayout}>
                {getFieldDecorator('g_unit_3', {
                  initialValue: fieldInits.g_unit_3,
                })(<Select>
                  {
                    units.map(gt =>
                      <Option value={gt.text} key={gt.value}>{gt.text}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unitNetWt')} {...formItemLayout}>
                {getFieldDecorator('unit_net_wt', {
                  initialValue: fieldInits.unit_net_wt,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unitPrice')} {...formItemLayout}>
                {getFieldDecorator('unit_price', {
                  initialValue: fieldInits.unit_price,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('currency')} {...formItemLayout}>
                {getFieldDecorator('currency', {
                  initialValue: fieldInits.currency,
                })(
                  <Select combobox optionFilterProp="search">
                    {
                      currencies.map(data => (<Option value={data.text} key={data.value}
                        search={`${data.value}${data.text}`}
                      >{`${data.value} | ${data.text}`}</Option>)
                      )}
                  </Select>
                  )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('fixedQty')} {...formItemLayout}>
                {getFieldDecorator('fixed_qty', {
                  initialValue: fieldInits.fixed_qty,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('fixedUnit')} {...formItemLayout}>
                {getFieldDecorator('fixed_unit', {
                  initialValue: fieldInits.fixed_unit,
                })(<Select>
                  {
                    units.map(gt =>
                      <Option value={gt.text} key={gt.value}>{gt.text}</Option>
                    )
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('origCountry')} {...formItemLayout}>
                {getFieldDecorator('origin_country', {
                  initialValue: fieldInits.origin_country,
                })(
                  <Select combobox optionFilterProp="search">
                    {
                      tradeCountries.map(data => (<Option value={data.text} key={data.value}
                        search={`${data.value}${data.text}`}
                      >{`${data.value} | ${data.text}`}</Option>)
                      )}
                  </Select>
                  )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('preClassifyNo')} {...formItemLayout}>
                {getFieldDecorator('pre_classify_no', {
                  initialValue: fieldInits.pre_classify_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('preClassifyStartDate')} {...formItemLayout}>
                {getFieldDecorator('pre_classify_start_date', {
                  initialValue: fieldInits.pre_classify_start_date,
                })(<DatePicker />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('preClassifyEndDate')} {...formItemLayout}>
                {getFieldDecorator('pre_classify_end_date', {
                  initialValue: fieldInits.pre_classify_end_date,
                })(<DatePicker />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={16}>
              <FormItem label={this.msg('remark')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                {getFieldDecorator('remark', {
                  initialValue: fieldInits.remark,
                })(<Input type="textarea" autosize={{ minRows: 1, maxRows: 16 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
