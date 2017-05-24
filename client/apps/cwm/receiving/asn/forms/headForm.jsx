/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Input, Select, DatePicker, Card, Col, Radio, Row } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const dateFormat = 'YYYY/MM/DD';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
export default class HeadForm extends Component {
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
      <Card>
        <Row gutter={16}>
          <Col sm={24} lg={8}>
            <FormItem label="仓库">
              {getFieldDecorator('whse_code', {
              })(
                <Select mode="combobox"
                  optionFilterProp="search"
                  placeholder="选择仓库"
                >
                  <Option value="0961">物流大道仓库</Option>
                  <Option value="0962">希雅路仓库</Option>
                  <Option value="0963">富特路仓库</Option>
                </Select>
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="入库货物属性">
              {getFieldDecorator('bonded', {
              })(
                <RadioGroup>
                  <RadioButton value={0}>非保税</RadioButton>
                  <RadioButton value={1}>保税</RadioButton>
                </RadioGroup>
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="入库类型">
              {getFieldDecorator('reg_type', {
              })(
                <RadioGroup>
                  <RadioButton value={0}>先报关后入库</RadioButton>
                  <RadioButton value={1}>先入库后报关</RadioButton>
                  <RadioButton value={2}>区内转入</RadioButton>
                </RadioGroup>
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="货主">
              {getFieldDecorator('owner_code', {
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
            <FormItem label="关联订单号">
              {getFieldDecorator('ref_order_no', {
              })(
                <Input />
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="到货日期" >
              {getFieldDecorator('est_receive_date', {
              })(<DatePicker defaultValue={moment('2015/01/01', dateFormat)} format={dateFormat} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
