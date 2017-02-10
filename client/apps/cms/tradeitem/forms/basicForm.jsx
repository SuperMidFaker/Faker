/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col, Row, DatePicker } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

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
    ['cop_product_no', 'hscode', 'g_name', 'g_model', 'element', 'g_unit_ftz', 'g_unit', 'unit_1', 'unit_2',
      'fixed_unit', 'origin_country', 'customs_control', 'inspection_quarantine',
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
  }),
)
export default class BasicForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
    currencies: PropTypes.array,
    units: PropTypes.array,
    tradeCountries: PropTypes.array,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, fieldInits, currencies, units, tradeCountries } = this.props;
    return (
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
              })(<Input />)}
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
        </Row>
        <Row>
          <Col sm={24} lg={16}>
            <FormItem label={this.msg('element')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {getFieldDecorator('element', {
                initialValue: fieldInits.element,
              })(<Input type="textarea" autosize={{ minRows: 1, maxRows: 16 }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('gUnitFtz')} {...formItemLayout}>
              {getFieldDecorator('g_unit_ftz', {
                initialValue: fieldInits.g_unit_ftz,
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
            <FormItem label={this.msg('gUnit')} {...formItemLayout}>
              {getFieldDecorator('g_unit', {
                initialValue: fieldInits.g_unit,
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
            <FormItem label={this.msg('customsControl')} {...formItemLayout}>
              {getFieldDecorator('customs_control', {
                initialValue: fieldInits.customs_control,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('inspQuarantine')} {...formItemLayout}>
              {getFieldDecorator('inspection_quarantine', {
                initialValue: fieldInits.inspection_quarantine,
              })(<Input />)}
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
    );
  }
}
