import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, InputNumber, Select, Row, Col, Button } from 'antd';
import { createException, loadExceptionReasons } from 'common/reducers/trackingLandException';
import { TRANSPORT_EXCEPTIONS } from 'common/constants';

const { TextArea } = Input;
const Option = Select.Option;

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
    exceptionReasons: state.trackingLandException.exceptionReasons,
  }),
  { createException, loadExceptionReasons }
)
@Form.create()
export default class RejectionForm extends React.Component {
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
    loadExceptionReasons: PropTypes.func.isRequired,
  }
  state = {
  }
  componentWillMount() {
    this.props.loadExceptionReasons(this.props.tenantId);
  }
  handleSubmit = () => {
    const {
      dispId, tenantId, tenantName, loginId, loginName,
    } = this.props;
    const exception = TRANSPORT_EXCEPTIONS.find(item => item.key === 'SHIPMENT_EXCEPTION_DELIVER_REJECTED');
    const { rejectedQty, excpReason, remark } = this.props.form.getFieldsValue();
    if (!rejectedQty && !excpReason) {
      message.warn('请至少填写破损或短少总数量的其中一项');
    } else {
      this.props.createException(
        dispId, exception.level, exception.code, exception.name, remark,
        {
          rejected_qty: rejectedQty,
          reason_id: excpReason,
        }, tenantId, tenantName, loginId, loginName
      ).then((result) => {
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
    const { form: { getFieldDecorator }, exceptionReasons } = this.props;
    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="拒收总数量">
              {getFieldDecorator('rejectedQty', {
                initialValue: 0,
                rules: [{
                  type: 'number',
                  required: true,
                  message: '拒收总数量',
                }],
              })(<InputNumber min={0} style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="拒收原因">
              {getFieldDecorator('excpReason', {
                initialValue: '0',
                rules: [{
                  type: 'number',
                  required: true,
                  message: '拒收原因',
                }],
              })(<Select style={{ width: '100%' }} >
                {exceptionReasons.map(item => (<Option value={item.id}>{item.name}</Option>))}
              </Select>)}
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
