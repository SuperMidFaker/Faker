import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, InputNumber, Row, Col, Button } from 'antd';
import { createException } from 'common/reducers/trackingLandException';
import { TRANSPORT_EXCEPTIONS } from 'common/constants';

const { TextArea } = Input;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    shipmtNo: state.shipment.previewer.dispatch.shipmt_no,
    parentNo: state.shipment.previewer.shipmt.parent_no,
    dispId: state.shipment.previewer.dispatch.id,
  }),
  { createException }
)
@Form.create()
export default class DamageForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    parentNo: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    createException: PropTypes.func.isRequired,
  }
  state = {
  }
  handleSubmit = () => {
    const { dispId, tenantId, tenantName, loginId, loginName } = this.props;
    const exception = TRANSPORT_EXCEPTIONS.find(item => item.key === 'SHIPMENT_EXCEPTION_GOODS_SHORTAGE');
    const { damagedQty, shortageQty, remark } = this.props.form.getFieldsValue();
    if (!damagedQty && !shortageQty) {
      message.warn('请至少填写破损或短少总数量的其中一项');
    } else {
      this.props.createException(
        dispId, exception.level, exception.code, exception.name, remark,
        {
          damaged_qty: damagedQty,
          shortage_qty: shortageQty,
        }, tenantId, tenantName, loginId, loginName).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.handleClear();
          }
        });
    }
  }
  handleClear = () => {
    this.props.form.resetFields();
    this.setState({
    });
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="破损总数量">
              {getFieldDecorator('damagedQty', {
                initialValue: 0,
                rules: [{
                  type: 'number',
                  required: true,
                  message: '破损总数量',
                }],
              })(<InputNumber min={0} style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="短少总数量">
              {getFieldDecorator('shortageQty', {
                initialValue: 0,
                rules: [{
                  type: 'number',
                  required: true,
                  message: '短少总数量',
                }],
              })(<InputNumber min={0} style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="备注">
              {getFieldDecorator('remark', {
                rules: [{
                  type: 'string',
                  message: '备注',
                }],
              })(<TextArea placeholder="请填写备注" autosize />)}
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" onClick={this.handleSubmit}>提交</Button>
      </Form>
    );
  }
}
