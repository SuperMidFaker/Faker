import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { changePassword } from 'common/reducers/account';
import { getFormatMsg } from 'client/util/react-ant';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
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
@Form.create()
export default class ChangePassword extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    changePassword: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  oldPwdRules = {
    validate: [{
      rules: [
        { required: true, whitespace: true, message: this.msg('pwdRequired') },
      ],
      trigger: ['onBlur', 'onChange'],
    }],
  }

  pwdRules = {
    rules: [{
      required: true, whitespace: true, min: 6, message: this.msg('newPwdRule'),
    }, {
      validator: (rule, value, callback) => {
        if (value) {
          if (value === this.props.form.getFieldValue('oldPwd')) {
            callback(this.msg('samePwd'));
          } else {
            this.props.form.validateFields(['confirmPwd']);
            callback();
          }
        } else {
          callback();
        }
      },
    }],
  }

  confirmPwdRules = {
    rules: [{
      required: true, whitespace: true, message: this.msg('pwdRequired'),
    }, {
      validator: (rule, value, callback) => {
        if (value && value !== this.props.form.getFieldValue('newPwd')) {
          callback(this.msg('pwdUnmatch'));
        } else {
          callback();
        }
      },
    }],
  }

  handlePasswordChange = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.changePassword(values.oldPwd, values.newPwd).then((result) => {
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
    const { form: { getFieldDecorator, getFieldError } } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
        help={rules && getFieldError(field)} hasFeedback required
      >
        {getFieldDecorator(field, rules)(<Input type="password" />)}
      </FormItem>
    );
  }
  render() {
    const { intl } = this.props;
    return (
      <div className="page-body-center">
        <div className="panel-heading">
          <h3>{this.msg('pwdTitle')}</h3>
          <Button size="large" onClick={this.handleCancel} style={{ float: 'right' }} icon="left">{formatGlobalMsg(intl, 'back')}</Button>
        </div>
        <div className="panel-body">
          <Form horizontal onSubmit={this.handlePasswordChange}
            className="form-edit-content offset-right-col"
          >
            {this.renderTextInput(this.msg('oldPwd'), 'oldPwd', this.oldPwdRules)}
            {this.renderTextInput(this.msg('newPwd'), 'newPwd', this.pwdRules)}
            {this.renderTextInput(this.msg('confirmPwd'), 'confirmPwd', this.confirmPwdRules)}
            <Row>
              <Col span="18" offset="6">
                <Button htmlType="submit" size="large" type="primary">{formatGlobalMsg(intl, 'ok')}</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
