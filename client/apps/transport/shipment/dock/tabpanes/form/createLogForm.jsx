import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Row, Button } from 'antd';
import { createLog } from 'common/reducers/shipment';
import { SHIPMENT_LOG_CATEGORY } from 'common/constants';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    shipmtNo: state.shipment.previewer.dispatch.shipmt_no,
    dispId: state.shipment.previewer.dispatch.id,
  }),
  { createLog }
)
@Form.create()
export default class CreateLogForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    createLog: PropTypes.func.isRequired,
  }
  handleOk = () => {
    const { form, dispId, shipmtNo, loginId, loginName, tenantId, tenantName } = this.props;
    const fieldsValue = form.getFieldsValue();
    if (fieldsValue && fieldsValue.message) {
      this.props.form.setFieldsValue({ message: '' });
      this.props.createLog({
        dispId,
        shipmtNo,
        category: SHIPMENT_LOG_CATEGORY.message,
        loginId,
        tenantId,
        tenantName,
        loginName,
        content: fieldsValue.message,
      }).then((result) => {
        if (result.error) {
          message.error(result.error);
        } else {
          message.info('添加成功');
        }
      });
    } else {
      message.error('内容不能为空');
    }
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form className="row" style={{ width: '100%' }}>
        <Row >
          {getFieldDecorator('message', {
            initialValue: '',
          })(
            <Input.TextArea id="control-textarea" rows="5" placeholder="点击添加备注内容" />
          )}
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Button onClick={this.handleOk}>提交</Button>
        </Row>
      </Form>
    );
  }
}
