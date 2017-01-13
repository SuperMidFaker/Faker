import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col, Row } from 'antd';
import { DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    delgBill: state.cmsDelegation.delgBill,
  }),
)
export default class SubForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    delgBill: PropTypes.object.isRequired,
    ietype: PropTypes.string.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator }, ietype, delgBill } = this.props;
    const DECL_TYPE = ietype === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
    return (
      <Card title={this.msg('delgClearance')} bodyStyle={{ padding: 16 }}>
        <Row style={{ marginBottom: 8 }}>
          <Col sm={8}>
            <FormItem label={this.msg('declareWay')} {...formItemLayout}>
              {getFieldDecorator('decl_way_code', {
                rules: [{ required: true, message: '报关类型必选' }],
                initialValue: delgBill.decl_way_code,
              })(<Select>
                {
                  DECL_TYPE.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={16}>
            <FormItem label={this.msg('remark')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
              {getFieldDecorator('headremark', {
                initialValue: delgBill.remark,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
