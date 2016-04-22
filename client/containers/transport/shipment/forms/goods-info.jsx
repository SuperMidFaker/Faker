import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Select, Table } from 'ant-ui';
import InputItem from './input-item';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const Option = Select.Option;
export default class PickupInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    goods: PropTypes.array.isRequired,
    labelColSpan: PropTypes.number.isRequired,
    formhoc: PropTypes.object.isRequired
  }
  static defaultProps = {
    goods: [{ op: '添加'}]
  }
  state = {
  }
  getComboFilter = (input, option) =>
    option.props.datalink.name.toLowerCase().indexOf(input.toLowerCase()) !== -1
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  columns = [{
    title: this.msg('shipNo'),
    dataIndex: 'shipNo'
  }, {
    title: this.msg('shipCarrier'),
    dataIndex: 'carrier'
  }]
  handleComboChange = (/* value, label */) => {
  }
  render() {
    const {
      labelColSpan, formhoc, goods,
      formhoc: { getFieldError, getFieldProps }
    } = this.props;
    const outerColSpan = 8;
    return (
      <Row>
        <div className="subform-heading">
          <div className="subform-title">{this.msg('pickupInfo')}</div>
        </div>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('consignor')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} help={getFieldError('sender')} required
          >
            <Select combobox defaultValue="aa" filterOption={this.getComboFilter}
              onChange={this.handleComboChange}
            >
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
          <InputItem formhoc={formhoc} labelName={this.msg('loadingPort')}
            field="loadingPort" colSpan={labelColSpan}
          />
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <FormItem label={this.msg('consignor')} labelCol={{span: labelColSpan}}
            wrapperCol={{span: 24 - labelColSpan}} help={getFieldError('sender')} required
          >
            <Select defaultValue="aa" {...getFieldProps('sender', [{
              required: true, message: this.msg('consignorMessage')
            }])}
            >
              <Option value="aa">aa</Option>
            </Select>
          </FormItem>
          <InputItem formhoc={formhoc} labelName={this.msg('loadingPort')}
            field="loadingPort" colSpan={labelColSpan} addonAfter="公斤"
          />
        </Col>
        <Col span={`${outerColSpan}`} className="subform-body">
          <InputItem formhoc={formhoc} labelName={this.msg('loadingPort')}
            field="loadingPort" colSpan={labelColSpan} addonAfter="元"
          />
        </Col>
        <Table columns={this.columns} dataSource={goods} pagination={false} />
      </Row>);
  }
}
