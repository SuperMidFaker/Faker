/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Select, Card, Col, Icon, Input, Row, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

@injectIntl
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('seq'),
    width: 50,
  }, {
    title: this.msg('opColumn'),
    width: 80,
  }, {
    title: this.msg('sku'),
    dataIndex: 'sku',
    width: 300,
  }, {
    title: this.msg('unit'),
    width: 60,
    dataIndex: 'unit',
  }, {
    title: this.msg('qty'),
    width: 50,
    dataIndex: 'qty',
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card title="产品属性">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label="货主">
                {getFieldDecorator('owner_name', {
                })(
                  <Select mode="combobox"
                    optionFilterProp="search"
                    placeholder="选择货主"
                  >
                    <Option value="04601">04601|米思米(中国)精密机械贸易</Option>
                    <Option value="0962">希雅路仓库</Option>
                    <Option value="0963">富特路仓库</Option>
                  </Select>
                    )}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('productNo')}>
                {getFieldDecorator('product_no', {
                })(
                  <Select mode="combobox"
                    optionFilterProp="search"
                  >
                    <Option value="B10EW">Ballo Green Dome Standard</Option>
                    <Option value="CPU200">CPU200 Assembly</Option>
                    <Option value="CPU600">CPU600</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('category')}>
                {getFieldDecorator('product_category', {
                })(
                  <Select mode="combobox"
                    optionFilterProp="search"
                    placeholder="选择产品分类"
                  >
                    <Option value="Ballo">Ballo</Option>
                    <Option value="CPU">CPU</Option>
                    <Option value="Float">Float</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('descCN')}>
                {getFieldDecorator('desc_cn', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('descEN')}>
                {getFieldDecorator('desc_en', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('unitMeasure')}>
                {getFieldDecorator('unit', {
                })(
                  <Select
                    optionFilterProp="search"
                    placeholder="选择计量主单位"
                  >
                    <Option value="Ballo">个</Option>
                    <Option value="CPU">件</Option>
                    <Option value="CPU">套</Option>
                    <Option value="Float">公斤</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('unitPrice')} >
                {getFieldDecorator('unit_price', {
                })(<InputGroup compact>
                  <Select size="large" style={{ width: '30%' }} defaultValue="RMB">
                    <Option value="RMB">人民币</Option>
                    <Option value="USD">美元</Option>
                  </Select>
                  <Input style={{ width: '70%' }} />
                </InputGroup>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('alias1')}>
                {getFieldDecorator('alias1', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('alias2')}>
                {getFieldDecorator('alias2', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('alias3')}>
                {getFieldDecorator('alias3', {
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="SKU" extra={<a href="#">Add variant</a>}>
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={(
                <span>
                  SKU&nbsp;
                  <Tooltip title="SKU (Stock Keeping Unit) is a unique name for your product.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
                )}
              >
                {getFieldDecorator('sku', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('perUnitQty')}>
                {getFieldDecorator('per_unit_qty', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unit')}>
                {getFieldDecorator('unit', {
                })(
                  <Select
                    optionFilterProp="search"
                    placeholder="选择SKU包装单位"
                  >
                    <Option value="Ballo">木箱</Option>
                    <Option value="CPU">纸箱</Option>
                    <Option value="Float">包</Option>
                    <Option value="Float">托盘</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('length')}>
                {getFieldDecorator('length', {
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('width')}>
                {getFieldDecorator('width', {
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('height')}>
                {getFieldDecorator('height', {
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={6}>
              <FormItem label={this.msg('unitCBM')}>
                {getFieldDecorator('unit_cbm', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('grossWeight')}>
                {getFieldDecorator('gross_weight', {
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('netWeight')}>
                {getFieldDecorator('net_weight', {
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('tareWeight')}>
                {getFieldDecorator('tare_weight', {
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
