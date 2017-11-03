/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
        <Card>
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('productName')}>
                {getFieldDecorator('product_name', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
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
            <Col sm={24} lg={12}>
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
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('description')}>
                {getFieldDecorator('product_desc', {
                })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('type')}>
                {getFieldDecorator('product_type', {
                })(
                  <Select
                    placeholder="选择类型"
                  >
                    <Option value="RM">Raw Material</Option>
                    <Option value="HP">Half Product</Option>
                    <Option value="FP">Finished Product</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('unitPrice')} >
                {getFieldDecorator('unit_price', {
                })(<InputGroup compact>
                  <Select style={{ width: '20%' }} defaultValue="RMB">
                    <Option value="RMB">人民币</Option>
                    <Option value="USD">美元</Option>
                  </Select>
                  <Input style={{ width: '80%' }} />
                </InputGroup>)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="Inventory" extra={<a href="#">Add variant</a>}>
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
                {getFieldDecorator('sku_no', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('unitMeasure')}>
                {getFieldDecorator('product_um', {
                })(
                  <Select
                    optionFilterProp="search"
                    placeholder="选择计量单位"
                  >
                    <Option value="Ballo">个</Option>
                    <Option value="CPU">箱</Option>
                    <Option value="Float">公斤</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('safetyStock')}>
                {getFieldDecorator('safety_stock', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={4}>
              <FormItem label={this.msg('length')}>
                {getFieldDecorator('length', {
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={4}>
              <FormItem label={this.msg('width')}>
                {getFieldDecorator('width', {
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={4}>
              <FormItem label={this.msg('height')}>
                {getFieldDecorator('height', {
                })(<Input addonAfter="mm" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={4}>
              <FormItem label={this.msg('unitCBM')}>
                {getFieldDecorator('unit_cbm', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={4}>
              <FormItem label={this.msg('grossWeight')}>
                {getFieldDecorator('gross_weight', {
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={4}>
              <FormItem label={this.msg('netWeight')}>
                {getFieldDecorator('net_weight', {
                })(<Input addonAfter="KG" />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
