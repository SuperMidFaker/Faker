import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, Row, Col, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { changePassword } from 'universal/redux/reducers/account';
import { getFormatMsg } from 'reusable/browser-util/react-ant';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import './acc.less';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const FormItem = Form.Item;

@injectIntl
@connect(
  () => ({
  }),
  { changePassword }
)
@Form.formify({
  formPropName: 'formhoc'
})
export default class ChangePassword extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired,
    changePassword: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key) => formatMsg(this.props.intl, key);
  oldPwdRules = {
    validate: [{
      rules: [
        { required: true, whitespace: true, message: this.msg('pwdRequired') }
      ],
      trigger: [ 'onBlur', 'onChange' ]
    }]
  }

  pwdRules = {
    rules: [{
      required: true, whitespace: true, min: 6, message: this.msg('newPwdRule')
    }, {
      validator: (rule, value, callback) => {
        if (value) {
          if (value === this.props.formhoc.getFieldValue('oldPwd')) {
            callback(this.msg('samePwd'));
          } else {
            this.props.formhoc.validateFields(['confirmPwd']);
            callback();
          }
        } else {
          callback();
        }
      }
    }]
  }

  confirmPwdRules = {
    rules: [{
      required: true, whitespace: true, message: this.msg('pwdRequired')
    }, {
      validator: (rule, value, callback) => {
        if (value && value !== this.props.formhoc.getFieldValue('newPwd')) {
          callback(this.msg('pwdUnmatch'));
        } else {
          callback();
        }
      }
    }]
  }

  handlePasswordChange = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields((errors, values) => {
      if (!errors) {
        this.props.changePassword(values.oldPwd, values.newPwd).then(result => {
          if (result.error) {
            message.error(getFormatMsg(result.error.message, this.msg));
          } else {
            this.context.router.goBack();
          }
        });
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  renderTextInput(labelName, field, rules) {
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 7}}
        help={rules && getFieldError(field)} hasFeedback required>
        <Input type="password" { ...getFieldProps(field, rules) } />
      </FormItem>
    );
  }
  render() {
    const { intl, formhoc } = this.props;
    return (
      <div className="acc-panel">
        <div className="panel-heading">
          <h3>{this.msg('pwdTitle')}</h3>
        </div>
        <div className="panel-body">
          <Form horizontal onSubmit={this.handlePasswordChange} form={formhoc}>
            { this.renderTextInput(this.msg('oldPwd'), 'oldPwd', this.oldPwdRules) }
            { this.renderTextInput(this.msg('newPwd'), 'newPwd', this.pwdRules) }
            { this.renderTextInput(this.msg('confirmPwd'), 'confirmPwd', this.confirmPwdRules) }
            <Row>
              <Col span="2" offset="7">
                <Button htmlType="submit" size="large" type="primary">{formatGlobalMsg(intl, 'ok')}</Button>
              </Col>
              <Col span="2">
                <Button size="large" onClick={this.handleCancel}>{formatGlobalMsg(intl, 'back')}</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
