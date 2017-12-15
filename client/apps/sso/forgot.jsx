import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Form, Icon, Input } from 'antd';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { requestSms, verifySms } from 'common/reducers/auth';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    smsId: state.auth.smsId,
    userId: state.auth.userId,
  }),
  { requestSms, verifySms }
)
export default class Forgot extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    smsId: PropTypes.number,
    userId: PropTypes.number,
    requestSms: PropTypes.func.isRequired,
    verifySms: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    error: null, // { message: {}},
    phone: '',
    smsCode: '',
    newPwd: '',
  }
  handleTextChange(ev, field) {
    this.setState({ [field]: ev.target.value });
  }
  handleSmsRequest(ev) {
    ev.preventDefault();
    this.props.requestSms(this.state.phone).then((result) => {
      if (result.error) {
        this.setState({ error: result.error });
      }
    });
  }
  handleSmsCancel(ev) {
    ev.preventDefault();
    this.context.router.goBack();
  }
  handleSmsVerify(ev) {
    ev.preventDefault();
    this.props.verifySms(
      this.props.smsId, this.props.userId,
      this.state.smsCode, this.state.newPwd
    ).then((result) => {
      if (result.error) {
        this.setState({ error: result.error });
      } else {
        this.context.router.replace('/login');
      }
    });
  }
  render() {
    // todo resendSmsCode
    const { intl } = this.props;
    const error = this.state.error;
    return (
      <Card bodyStyle={{ padding: 64 }}>
        {!this.props.smsId ?
        (<Form layout="horizontal">
          <p className="text-center">{formatMsg(intl, 'verifyCodeGuide')}</p>
          <FormItem>
            {(
              <Input addonBefore={<Icon type="mobile" />} placeholder={formatMsg(intl, 'phonePlaceholder')} value={this.state.phone} maxlenght="11"
                onChange={ev => this.handleTextChange(ev, 'phone')}
              />
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" className="btn btn-block btn-lg" onClick={ev => this.handleSmsRequest(ev)}>
              {formatMsg(intl, 'verifyObtatin')}
            </Button>
          </FormItem>
          <FormItem>
            <Button type="ghost" className="btn btn-block" onClick={ev => this.handleSmsCancel(ev)}>
              {formatGlobalMsg(intl, 'cancel')}
            </Button>
          </FormItem>
          {
            error && (
            <div className="row text-center">
              <p className="text-warning">{formatMsg(intl, error.message.key, error.message.values)}</p>
            </div>)
          }
        </Form>)
          :
        (<Form layout="horizontal">
          <p className="text-center">{formatMsg(intl, 'smsCodeSent')} </p>
          <FormItem>
            {(
              <Input name="smsCode" addonBefore={<Icon type="mail" />} placeholder={formatMsg(intl, 'smsCode')} value={this.state.smsCode} maxlenght="6"
                onChange={ev => this.handleTextChange(ev, 'smsCode')}
              />
            )}
          </FormItem>
          <FormItem>
            {(
              <Input name="newPwd" addonBefore={<Icon type="lock" />} type="Password" placeholder={formatMsg(intl, 'newPwdPlaceholder')} value={this.state.newPwd}
                onChange={ev => this.handleTextChange(ev, 'newPwd')}
              />
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" className="btn btn-block btn-lg" onClick={ev => this.handleSmsVerify(ev)}>
              {formatMsg(intl, 'finishVerify')}
            </Button>
          </FormItem>
          <FormItem>
            <Button type="ghost" className="btn btn-block" onClick={ev => this.handleSmsCancel(ev)}>
              {formatGlobalMsg(intl, 'cancel')}
            </Button>
          </FormItem>
          {
            error && (
            <div className="row text-center">
              <p className="text-warning">{formatMsg(intl, error.message.key, error.message.values)}</p>
            </div>)
          }
        </Form>)
        }
      </Card>
    );
  }
}
