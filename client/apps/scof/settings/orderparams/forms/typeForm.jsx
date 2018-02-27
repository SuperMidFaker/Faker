import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { message, Button, Col, Form, Input, Radio } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { SCOF_ORDER_TRANSFER } from 'common/constants';
import { upsertOrderType } from 'common/reducers/sofOrderPref';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    visible: state.sofOrderPref.orderTypeModal.visible,
    orderType: state.sofOrderPref.orderTypeModal.orderType,
  }),
  { upsertOrderType }
)
@Form.create()
export default class TypeForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.form.resetFields();
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleTypeSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const { orderType } = this.props;
        this.props.upsertOrderType({ id: orderType.id, ...values }).then((result) => {
          if (!result.error) {
            message.success('保存成功');
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, orderType } = this.props;
    return (
      <Form>
        <FormItem label={this.msg('orderTypeInfo')}>
          <Col span={12}>
            {getFieldDecorator('name', {
              initialValue: orderType.name,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input placeholder={this.msg('类型名称')} />)}
          </Col>
          <Col span={10} offset={1}>
            {getFieldDecorator('code', {
              initialValue: orderType.code,
            })(<Input placeholder={this.msg('类型代码，用于数据导入')} />)}
          </Col>
        </FormItem>
        <FormItem label={this.msg('orderTransfer')}>
          {getFieldDecorator('transfer', {
            initialValue: orderType.transfer,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<RadioGroup>
            {SCOF_ORDER_TRANSFER.map(sot =>
              (<RadioButton value={sot.value} key={sot.value}>
                {sot.text}: {sot.desc}</RadioButton>))}
          </RadioGroup>)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save" onClick={this.handleTypeSave}>{this.gmsg('save')}</Button>
        </FormItem>
      </Form>
    );
  }
}
